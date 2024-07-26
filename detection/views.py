import cv2
import threading
import time
from django.http import StreamingHttpResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from . drowsiness_detection import gen_frames
from django.http import JsonResponse
from django.contrib.auth.models import User
from . forms import CustomUserFrom
from django.contrib.auth import login, logout, authenticate 
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from . models import Warning, Score, CollectWarnings

        
    

def sendWarnings(request):
    warnings = CollectWarnings.objects.all().order_by('created')

    data = {
        'timestamps': [warning.created.strftime('%Y-%m-%d') for warning in warnings],
        'warnings_values': [int(warning.warning) for warning in warnings if warning.warning],
    }

    return JsonResponse(data)


def get_chart_data(request):
    # Retrieve chart data from the database
    chart_data = Score.objects.all()
    
    # Prepare data in the format you want to send to the frontend
    data = {
        "labels": [item.date.strftime('%H:%M') for item in chart_data],
        "data": [item.value for item in chart_data],
    }
    return JsonResponse(data)

def chatbot(request):
    return render(request, 'detection/index.html')
@csrf_exempt
def returnWarning(request):
    if request.method == "POST":
        obj = Warning.objects.get(id = "2a36fc1d-6237-439b-9fa3-9b05e9002b8c")
        obj.reset_flag = 1
        obj.save()
        print("we are here inside the messaging system")
        return JsonResponse({'message':"success"})
    
    obj = Warning.objects.get(id="2a36fc1d-6237-439b-9fa3-9b05e9002b8c")
    warnings = obj.warning
    return JsonResponse({'warnings':warnings})

def loginUser(request):
    if request.user.is_authenticated:
        return redirect("detect")
    if request.method == "POST":
        data = request.POST
        username = data.get("username")
        password = data.get("password")

        try:
            user = User.objects.get(username=username)
        except:
            messages.error(request, "User doesn't exists!!")
        
        user = authenticate(request, username=username, password= password)
        if user is not None:
            login(request, user)
            return redirect("detect")
        else:
            messages.error(request, "Username or Password Incorrect!!")
    page = "login"
    context = {'page':page}
    return render(request, 'detection/login-register.html', context)


def register(request):
    if request.user.is_authenticated:
        return redirect("detect")
    page = "register"
    form = CustomUserFrom()
    if request.method == "POST":
        print(request.POST)
        form = CustomUserFrom(request.POST)
        if form.is_valid():
            form.save()
            login(request, form)
            return redirect("detect")
            print("formed saved successfully")
        else:
            errors = form.errors
            print(errors)
            print("form is not valid")
    context = {'page':page, 'form':form}
    return render(request, 'detection/login-register.html', context)

def logOut(request):
    logout(request)
    return redirect("login")


@login_required(login_url="login")
def homePage(request):
    context = {}
    return render(request, 'detection/home_page.html', context)

@login_required(login_url="login")
def index(request):

    def setFlag(flag):
        obj = Warning.objects.get(id = "2a36fc1d-6237-439b-9fa3-9b05e9002b8c")
        obj.flag = flag
        obj.save()

    flag = 0 
    try:
        if request.method == "GET":
            flag = request.GET.get("flag")
            flag = int(flag)
            if not flag: 
                setFlag(1)
            else:
                setFlag(0)
    except:
        pass
    
    # print(warning)
    context = {'flag':flag}
    return render(request, 'detection/detect.html',context)

def video_feed(request):
    return StreamingHttpResponse(gen_frames(), content_type='multipart/x-mixed-replace; boundary=frame')





