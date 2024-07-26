import cv2
import os
from keras.models import load_model
from django.http import JsonResponse
import numpy as np
from pygame import mixer
import time
import threading
from . models import Warning , Score, CollectWarnings




def gen_frames():
    Score.objects.all().delete()
    CollectWarnings.objects.all().delete()
    warnings = 0
    warning_count = 0
    warning_flag = 1
    mixer.init()
    sound = mixer.Sound('static/images/war-1.mp3')

    face = cv2.CascadeClassifier('detection/haar cascade files/haarcascade_frontalface_alt.xml')
    leye = cv2.CascadeClassifier('detection/haar cascade files/haarcascade_lefteye_2splits.xml')
    reye = cv2.CascadeClassifier('detection/haar cascade files/haarcascade_righteye_2splits.xml')



    lbl=['Close','Open']

    model = load_model('detection/models/cnncat2.h5')
    path = os.getcwd()
    video_stream_url = f'https://10.0.0.238:8080/video'
    cap = cv2.VideoCapture(0)
    # cap.open(video_stream_url)
    font = cv2.FONT_HERSHEY_COMPLEX_SMALL
    count=0
    score=0
    thicc=2
    rpred=[99]
    lpred=[99]

    def decrement_warnings():
        nonlocal warning_count, warnings
        while True:
            time.sleep(20)
            if warning_count == warnings:
                warnings -= 1
                warnings = max(0, warnings)
                print(f"Current Warning Count: {warning_count}") 
                print("this is working")
        
            warning_count = warnings
        
    timer_thread = threading.Thread(target=decrement_warnings)
    timer_thread.daemon = True 
    timer_thread.start()


    def setFlag(value):
        obj = Warning.objects.get(id = "2a36fc1d-6237-439b-9fa3-9b05e9002b8c")
        obj.warning = value
        obj.save()
    

    while True:
        obj = Warning.objects.get(id = "2a36fc1d-6237-439b-9fa3-9b05e9002b8c")
        if obj.flag:
            setFlag(0)
            mixer.quit() 
            return 
        
        ret, frame = cap.read()
        # print("this is the frame", frame)
        height,width = frame.shape[:2] 

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
        faces = face.detectMultiScale(gray,minNeighbors=5,scaleFactor=1.1,minSize=(25,25))
        left_eye = leye.detectMultiScale(gray)
        right_eye =  reye.detectMultiScale(gray)

        cv2.rectangle(frame, (0,height-50) , (200,height) , (0,0,0) , thickness=cv2.FILLED )

        for (x,y,w,h) in faces:
            cv2.rectangle(frame, (x,y) , (x+w,y+h) , (100,100,100) , 1 )

        for (x,y,w,h) in right_eye:
            r_eye=frame[y:y+h,x:x+w]
            count=count+1
            r_eye = cv2.cvtColor(r_eye,cv2.COLOR_BGR2GRAY)
            r_eye = cv2.resize(r_eye,(24,24))
            r_eye= r_eye/255
            r_eye=  r_eye.reshape(24,24,-1)
            r_eye = np.expand_dims(r_eye,axis=0)
            rpred_probabilities = model.predict(r_eye)
            rpred = np.argmax(rpred_probabilities, axis=-1)
            if(rpred[0]==1):
                lbl='Open' 
            if(rpred[0]==0):
                lbl='Closed'
            break

        for (x,y,w,h) in left_eye:
            l_eye=frame[y:y+h,x:x+w]
            count=count+1
            l_eye = cv2.cvtColor(l_eye,cv2.COLOR_BGR2GRAY)  
            l_eye = cv2.resize(l_eye,(24,24))
            l_eye= l_eye/255
            l_eye=l_eye.reshape(24,24,-1)
            l_eye = np.expand_dims(l_eye,axis=0)
            lpred_probabilities = model.predict(l_eye)
            lpred = np.argmax(lpred_probabilities, axis=-1)
            if(lpred[0]==1):
                lbl='Open'   
            if(lpred[0]==0):
                lbl='Closed'
            break

        if(rpred[0]==0 and lpred[0]==0):
            score=score+1
            Score.objects.create(value=score)
            cv2.putText(frame,"Closed",(10,height-20), font, 1,(255,255,255),1,cv2.LINE_AA)
        # if(rpred[0]==1 or lpred[0]==1):
        else:
            score=score-1
            cv2.putText(frame,"Open",(10,height-20), font, 1,(255,255,255),1,cv2.LINE_AA)
    
        
        if(score<0):
            score=0  
            Score.objects.create(value=score) 
        cv2.putText(frame,'Score:'+str(score)+'  warnings: '+str(warnings),(100,height-20), font, 1,(255,255,255),1,cv2.LINE_AA)

        print(score)
        if(score>5):
            #person is feeling sleepy so we beep the alarm
            
            cv2.imwrite(os.path.join(path,'image.jpg'),frame)
            try:
                sound.play()
            
            except:  # isplaying = False
                pass
            if(thicc<16):
                thicc= thicc+2
            else:
                thicc=thicc-2
                if(thicc<2):
                    thicc=2
            cv2.rectangle(frame,(0,0),(width,height),(0,0,255),thicc)
        
        if(score < 5):
            sound.stop()

        if score == 5:
            warning_flag += 1 
        
        if ((warning_flag % 2) == 0) and (score == 5):
            CollectWarnings.objects.create(warning=warnings+1)
            warnings += 1    

        if warnings >= 1:
            setFlag(warnings)


        if obj.reset_flag:
            warnings = 0
            obj.reset_flag = 0
            obj.warning = 0
            print("obj flag is resetted")
            obj.save()

        ret, buffer = cv2.imencode('.jpg', frame)


        if ret:
            yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        time.sleep(0.1)
