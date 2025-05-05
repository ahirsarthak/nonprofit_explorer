# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from .trino_query import run_trino_query
from .functions import is_query_allowed, get_last_submissions,  load_table_metadata, build_prompt, generate_sql_with_openai, _store_failed_submission, get_submission_by_id, _store_submission_output, save_feedback
#from .spark_query import run_query_on_iceberg
from datetime import datetime
import uuid

def handle_failed_submission(query, ip, sql, prompt, error_msg):
    submission_id = str(uuid.uuid4())
    _store_failed_submission(
        submission_id, sql, prompt, error_msg,
        user_query=query, ip_address=ip, timestamp=datetime.now().isoformat()
    )
    return JsonResponse({'error': error_msg}, status=400)

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
    ip = request.data.get('ip_address')
    metadata = load_table_metadata()
    prompt = build_prompt(metadata, query)

    sql = generate_sql_with_openai(prompt)
    #print(sql)
    #allowed, forbidden_message = is_query_allowed(sql)
    #print(f'line40: {sql}')
    #print(f'line41: {allowed}')
    #print(f'line42: {forbidden_message}')
    #print(f'allowed value: {allowed}, type: {type(allowed)}')
    #if not allowed:
    #    print("This should never print if not allowed is False")
    #    return handle_failed_submission(query, ip, sql, prompt, forbidden_message)

    try:
        results = run_trino_query(sql)
    except Exception as e:
        return handle_failed_submission(query, ip, sql, prompt, str(e))

    #print(f'line52: {results}')

    if (not results or
    (isinstance(results, dict) and 'error' in results)):

    # If results is a dict with an error key, treat as failure
        error_msg = results['error'] if isinstance(results, dict) and 'error' in results else 'No results found for your query.'
        return handle_failed_submission(query, ip, sql, prompt, error_msg)


    submission_id = str(uuid.uuid4())
    _store_submission_output(
        submission_id, sql, prompt, results, False,
        user_query=query, ip_address=ip, timestamp=datetime.now().isoformat()
    )
    return JsonResponse({
        'submission_id': submission_id,
        'timestamp': datetime.now().isoformat(),
        'sql': sql,
        'results': results,
        'row_count': len(results)
    }, status=200)

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
    #print(f'line102: {sql}')
    try:
        results = run_trino_query(sql)
        #print(results)
        return JsonResponse({'sql': sql, 'results': results}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)