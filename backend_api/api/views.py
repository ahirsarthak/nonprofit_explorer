# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from .trino_query import run_trino_query
from .functions import is_query_allowed, save_submission, get_last_submissions, get_ip_from_request,  load_table_metadata, build_prompt, generate_sql_with_openai, _store_failed_submission, get_submission_by_id, _store_submission_output, save_feedback
#from .spark_query import run_query_on_iceberg
from datetime import datetime
import uuid

@api_view(['GET', 'POST'])
def sample_api(request):
#async def sample_api(request):
    if request.method == 'POST':
        data = request.data
        #await asyncio.sleep(1) 
        return Response({'message': 'Received data', 'data': data})
    #await asyncio.sleep(1)  
    return Response({'message': 'GET request successful'})

@api_view(['POST'])
def interpret_and_query(request):
    query = request.data.get('query')
    if not query or not query.strip():
        return JsonResponse({'error': 'Please enter a question or query to generate results.'}, status=400)
    ip = get_ip_from_request(request)
    metadata = load_table_metadata()
    prompt = build_prompt(metadata, query)

    sql = generate_sql_with_openai(prompt)
    allowed, forbidden_message = is_query_allowed(sql)
    if not allowed:
        # Generate a submission ID for tracking
        submission_id = str(uuid.uuid4())
        _store_failed_submission(
            submission_id, sql, prompt, forbidden_message,
            user_query=query, ip_address=ip, timestamp=datetime.now().isoformat()
        )
        return JsonResponse({'error': forbidden_message}, status=400)

    try:
        results = run_trino_query(sql)
    except Exception as e:
        submission_id = save_submission(query, ip)
        _store_failed_submission(
            submission_id, sql, prompt, str(e),
            user_query=query, ip_address=ip, timestamp=datetime.now().isoformat()
        )
        return JsonResponse({
            'error': 'An error occurred while processing your query. Please check your input or try again later.'
        }, status=400)

    submission_id = save_submission(query, ip)
    _store_submission_output(
        submission_id, sql, prompt, results, False,
        user_query=query, ip_address=ip, timestamp=datetime.now().isoformat()
    )
    return JsonResponse({'sql': sql, 'results': results}, status=200)

@api_view(['GET'])
def recent_submissions(request):
    # MongoDB-backed: returns recent queries
    return JsonResponse({'recent_queries': get_last_submissions()})

@api_view(['POST'])
def feedback_api(request):
    data = request.data
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    linkedin = data.get('linkedin', '').strip()
    thoughts = data.get('thoughts', '').strip()
    if not name or not email:
        return JsonResponse({'error': 'Name and email are required.'}, status=400)
    try:
        save_feedback(name, email, linkedin, thoughts)
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
def rerun_submission(request, submission_id):
    submission = get_submission_by_id(submission_id)
    if not submission or 'sql' not in submission:
        return JsonResponse({'error': 'Submission not found or missing SQL'}, status=404)
    sql = submission['sql']
    print(sql)
    try:
        results = run_trino_query(sql)
        print(results)
        return JsonResponse({'sql': sql, 'results': results}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)