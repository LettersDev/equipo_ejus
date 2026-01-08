import urllib.request, json
url='http://127.0.0.1:8000/api/visitantes/?limit=10&ordering=-fecha_hora_ingreso'
req=urllib.request.Request(url, headers={'Accept':'application/json'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print(resp.status)
        print(resp.read().decode())
except Exception as e:
    print('Error:', e)
