import json
import urllib.request

url = 'http://127.0.0.1:8000/api/auth/register/'
data = json.dumps({'username':'testuser1','password':'testpass','full_name':'Test User'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={
    'Content-Type': 'application/json'
})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        print('Response:', body)
except Exception as e:
    print('Error calling register endpoint:', e)
