from rest_framework.decorators import api_view
from rest_framework.response import Response
import asyncio

@api_view(['GET', 'POST'])
def sample_api(request):
#async def sample_api(request):
    if request.method == 'POST':
        data = request.data
        #await asyncio.sleep(1) 
        return Response({'message': 'Received data', 'data': data})
    #await asyncio.sleep(1)  
    return Response({'message': 'GET request successful'})