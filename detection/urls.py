# your_app/urls.py

from django.urls import path
from . import views
from . import drowsiness_detection

urlpatterns = [
    path('', views.loginUser, name='login'),
    path('logout/', views.logOut, name='logout'),
    path('register/', views.register, name='register'),
    path('detect/flag=0', views.index, name='detect'),
    path('video_feed/', views.video_feed, name='videofeed'),
    path("api/counter/", views.returnWarning, name="warnings"),
    path("chatbot/", views.chatbot, name="chatbot"),
    path("getchartdata/", views.get_chart_data, name="get_chart_data"),
    path('warning-data/', views.sendWarnings, name='sendwarnings')
]
