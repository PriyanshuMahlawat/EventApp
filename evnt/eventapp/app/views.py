from django.shortcuts import render
import requests
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
import json
from .forms import EventForm
from .models import Event,Notifications,CurrentEvent,slots
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_protect
from allauth.socialaccount.models import SocialAccount

from rest_framework import generics
from rest_framework.views import APIView
from django.contrib.auth.models import Group


from rest_framework.response import Response
from .serializers import (
    EventSerializer,
    EventDetailSerializer,
    NotiSerializer,
    HostedEventsSerializer,
    AddingMembersSerializer,
    JoinedEventsSerializer,
    ManageEventSerializer,
    MembersListSerializer,
    CurrentEventSerializer,
    slotsSerializer
)



def create_slots():
    events = Event.objects.all()
    for e in events:
        event_id = e.id
        usernames = e.members.split(",") 
        
        for username in usernames:
            
            user = User.objects.get(username=username)
            
            
            if not slots.objects.filter(user=user, event_id=event_id).exists():
                slots.objects.create(user=user, event_id=event_id)
            else:
                print(f"Slot for user {username} and event {event_id} already exists.")


create_slots()

def index(request):
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        person = request.user.username
        email = request.user.email
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
        


        
    else:
        person = None
        email = None
    return render(request,"app/userpage.html",{"person":person,"email":email,"logged_in":logged_in,"image_url":image_url})

def myeventtab(request):
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
    return render(request,"app/myevent.html",{"logged_in":logged_in,"image_url":image_url})

def about(request):
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
    return render(request,'app/about.html',{"logged_in":logged_in,"image_url":image_url})

def editEvent(request):
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
    return render(request,"app/editevent.html",{"logged_in":logged_in,"image_url":image_url})

def DetailEvent(request):
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
    return render(request,"app/eventdetail.html",{"logged_in":logged_in,"image_url":image_url})

def noti(request):
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
    person = request.user.username
    return render(request,"app/notifications.html",{"person":person,"logged_in":logged_in,"image_url":image_url})

def slotspg(request):
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
    host = False
    event_id = request.COOKIES.get('event_id')
    name=request.user.username
    if(request.user.username == Event.objects.get(id = event_id).host.username):
        host = True
    return render(request,"app/slots.html",{"host":host,"name":name,"logged_in":logged_in,"image_url":image_url})

def roles(request):
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
    return render(request,"app/roles.html",{"logged_in":logged_in,"image_url":image_url})



@csrf_exempt
def manage(request):
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
    host = False
    event_id = request.COOKIES.get('event_id')
    
    

    try:
        event = Event.objects.get(id=event_id)
        if request.user.username == event.host.username:
            host = True
    except Event.DoesNotExist:
        print("Event not found")
        return render(request, "app/manage.html", {"error": "Event not found"})

    person = request.user.username
    
    context = {
        "person": person,
        "live": False,
        "1v": False,
        "2v": False,
        "3v": False,
        "4v": False,
        "host":False
    }
    
    if host:
        
        context["1v"] = True
        context["2v"] = True
        context["3v"] = True
        context["4v"] = True
        context["host"] = True

    user = request.user
    
    print(user.groups.all())
    if user.groups.filter(name="Add Members").exists():
        context["1v"] = True
    if user.groups.filter(name="Allow Noti").exists():
        context["2v"] = True
    if user.groups.filter(name="Remove Members").exists():
        context["3v"] = True
    if user.groups.filter(name="Edit Event").exists():
        context["4v"] = True

    context["logged_in"] = logged_in
    context["image_url"] = image_url
    
    
    

    return render(request, "app/manage.html", context)



@login_required
def hostpg(request):
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
    success = request.session.pop('success', False)
    error = request.session.pop('error', [])
    event_name = request.session.pop('event_name', None)
    
    if request.method == "POST":
        
        event_form = EventForm(request.POST,request.FILES)
        if event_form.is_valid():
            event_form.save(user=request.user)
            event_name = event_form.cleaned_data['Event_name']
            request.session['success'] = True
            request.session['event_name'] = event_name
        else:
            request.session['success'] = False
            request.session['error'] = list(event_form.errors.values())
        return redirect('popup')
    else:
        event_form = EventForm()
    
    return render(request, "app/hostpage.html", {
        "event_form": event_form,
        "success": success,
        "error": error,
        "event_name": event_name,
        "logged_in":logged_in,
        "image_url":image_url,
    })


@csrf_protect
def popup_view(request):
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
    context = {}
    context['success'] =request.session.get('success',False)
    context['event_name'] =request.session.get('event_name',None)
    context['error'] =request.session.get('error',[])
    context['logged_in'] = logged_in
    context['image_url'] = image_url
    return render(request,"app/popup.html",context)



class SlotsDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = slots.objects.all()
    serializer_class = slotsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        
        return slots.objects.get(user=self.request.user, event_id=self.kwargs['Event_Id'])


class EventSerializerAPIView(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class EventDetailSerializerAPIView(generics.RetrieveUpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventDetailSerializer
    lookup_field = 'pk'


class NotiSerializerAPIView(generics.ListCreateAPIView):
    queryset = Notifications.objects.all()
    serializer_class = NotiSerializer

class NotiDestroyUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notifications.objects.all()
    serializer_class = NotiSerializer 

class HostedEventSerializerAPIView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = HostedEventsSerializer

    def get_serializer_context(self):
        
        context = super().get_serializer_context()
        context.update({
            'request': self.request,  
        })
        return context
    

class HostedEventsUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = HostedEventsSerializer

    def get_serializer_context(self):
        context =  super().get_serializer_context() 
        context.update({
            "request":self.request,
        }) 
        return context  
    
class membersRetrieveAPIView(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = MembersListSerializer


class membersUpdateAPIView(generics.UpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = MembersListSerializer

class AddmembersAPIView(generics.UpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = AddingMembersSerializer 

    def update(self,request,*args,**kwargs):
        instance  =self.get_object()
        new_member = request.data.get('members','')

        if instance.members:
            instance.members += f",{new_member}"
        else:
            instance.members = new_member

        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)      


class JoinedAPIView(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = JoinedEventsSerializer

    def get_serializer_context(self):
        context =  super().get_serializer_context() 
        context.update({
            "request":self.request,
        }) 
        return context 

class LeaveEventAPIView(APIView):
    def delete(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            name = request.user.username
            if name in event.members:
                members_list = event.members.split(',')
                new_list = ",".join(member for member in members_list if member != name)
                event.members = new_list
                event.save()
                return Response({"message": "Successfully left the event."})
            else:
                return Response({"error": "Something is wrong. You are not in the members list."})
        except Event.DoesNotExist:
            return Response({"error": "Event not found."}, status=404)


class ManageEventAPI(generics.RetrieveUpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = ManageEventSerializer         
                        
class CurrentEventAPIView(APIView):
    

    def get(self, request):
        current_event, created = CurrentEvent.objects.get_or_create(user=request.user)
        serializer = CurrentEventSerializer(current_event)
        return Response(serializer.data)

    def post(self, request):
        current_event, created = CurrentEvent.objects.get_or_create(user=request.user)
        serializer = CurrentEventSerializer(current_event, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)