# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from openai import OpenAI
from .trino_query import run_trino_query
from .functions import save_submission, get_last_submissions
from .spark_query import run_query_on_iceberg
import os, json
from django.conf import settings
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env file

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
    #print(query)
    ip = request.data.get('ip_address') or \
         request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR')) or None

    timestamp = save_submission(query, ip)

    meta_path = os.path.join(settings.BASE_DIR, 'api', 'table_metadata.json')
    with open(meta_path, 'r') as f:
        metadata = json.load(f)

    prompt = f"""Convert the user's question into Polars SQL using the metadata: {json.dumps(metadata)}.

User Question: {query}
"""

    client = OpenAI(
            api_key=os.environ["OPEN_AI_API"]
    )
    response = client.chat.completions.create(
        model='gpt-4o',
        messages=[
            {"role": "system", "content": "You are a helpful assistant for SQL generation."},
            {"role": "user", "content": prompt}
        ]
    )
    sql = response.choices[0].message.content.strip()

    print(sql)

    try:
        results = run_trino_query(sql)
    except Exception as e:
        return JsonResponse({'error': 'Trino query failed', 'sql': sql, 'details': str(e)})

    return JsonResponse({'sql': sql, 'results': results})

@api_view(['GET'])
def recent_submissions(request):
    return JsonResponse({'recent_queries': get_last_submissions()})