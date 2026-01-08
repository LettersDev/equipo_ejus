import os
import django
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'RegistroVisitas_Backend.settings')

django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()

username = 'admin'
email = 'admin@example.com'
password = 'admin123'

user = User.objects.filter(username=username).first()
if user:
    print('User exists, updating password.')
    user.set_password(password)
    user.email = email
    user.save()
    print('Password updated for user', username)
else:
    User.objects.create_superuser(username=username, email=email, password=password)
    print('Created superuser', username)

print('Done')
