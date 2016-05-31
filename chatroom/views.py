from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
from django.views.decorators.csrf import ensure_csrf_cookie, requires_csrf_token, csrf_exempt

from chatroom.util_functions import get_user_id
from simple_chat import settings
import json
import pusher

p = pusher.Pusher(
    app_id=settings.PUSHER_APP_ID,
    key=settings.PUSHER_KEY,
    secret=settings.PUSHER_SECRET,
    ssl=True

)


@ensure_csrf_cookie
def index(request):
    user_id = get_user_id()
    request.session['user_id'] = user_id
    return render(request, 'chatroom/index.html',
                  {'PUSHER_KEY': settings.PUSHER_KEY,
                   'PUSHER_CHANNEL_NAME': settings.PUSHER_CHANNEL_NAME,
                   'USERNAME': user_id
                   })


@ensure_csrf_cookie
def message(request):
    msg = request.POST['text']
    p.trigger(settings.PUSHER_CHANNEL_NAME, 'new_message', {
        'new_message': msg,
        'user_id': request.POST['user_id']
    })
    return HttpResponse("")


@csrf_exempt
def auth(request):
    auth = p.authenticate(request.POST['channel_name'], request.POST['socket_id'],
                          {u'user_id': request.session.get('user_id', 'default'),
                           u'user_info': {
                               u'twitter': u'@pusher'
                           }})
    return HttpResponse(json.dumps(auth))
