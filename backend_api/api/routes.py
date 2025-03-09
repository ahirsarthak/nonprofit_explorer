from django.urls import path
from .functions import sample_api

print("ibn")
urlpatterns = [
    path('sample/', sample_api, name='sample-api'),
]