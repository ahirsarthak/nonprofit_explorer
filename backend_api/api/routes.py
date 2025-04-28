from django.urls import path
from .views import interpret_and_query, recent_submissions, sample_api, rerun_submission


print("ibn")
urlpatterns = [
    path('sample/', sample_api, name='sample-api'),
    path('query/', interpret_and_query),
    path('recent/', recent_submissions),
    path('rerun_submission/<str:submission_id>/', rerun_submission),
]
