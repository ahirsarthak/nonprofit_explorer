# functions.py
import os, json
from datetime import datetime
from django.conf import settings

def save_submission(query, ip_address):
    timestamp = datetime.utcnow().isoformat()
    submission = {'timestamp': timestamp, 'ip_address': ip_address, 'query': query}
    path = os.path.join(settings.BASE_DIR, 'api', 'user_queries', 'submissions.json')

    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path):
        with open(path, 'r') as f:
            all_submissions = json.load(f)
    else:
        all_submissions = []

    all_submissions.append(submission)
    with open(path, 'w') as f:
        json.dump(all_submissions, f, indent=2)

    return timestamp

def get_last_submissions(n=5):
    path = os.path.join(settings.BASE_DIR, 'api', 'user_queries', 'submissions.json')
    if not os.path.exists(path):
        return []

    with open(path, 'r') as f:
        submissions = json.load(f)

    return sorted(submissions, key=lambda x: x['timestamp'], reverse=True)[:n]
