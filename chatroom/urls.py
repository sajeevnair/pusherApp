from django.conf.urls import url

from . import views

app_name = 'chatroom'

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^auth/$', views.auth, name='auth'),
    url(r'^message/$', views.message, name='message'),
]
