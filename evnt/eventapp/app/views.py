from django.shortcuts import render
import requests
import openpyxl
from django.utils import timezone
from django.core.files.base import ContentFile
import io
from datetime import datetime
import pytz
from django.http import HttpResponse,FileResponse
from openpyxl import Workbook
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
import json
from .forms import EventForm
from .models import Event,Notifications,CurrentEvent,slots,completedEvents,RealTable
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_protect
from allauth.socialaccount.models import SocialAccount
from django.db import IntegrityError
from rest_framework import generics
from rest_framework.views import APIView
from django.contrib.auth.models import Group
from django.db import IntegrityError
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
    slotsSerializer,
    tableSlotSerializer,
    CompletedEventsSerializer,
    CurrentTableSerializer,
    RealTableSerializer,
)




def completedpage(request):
    event_id = request.COOKIES.get('event_id')
    host = False
    member = False
    if request.user.is_authenticated:
        username = request.user.username
        e = Event.objects.get(id=event_id)
        hostname = e.host.username
        members = e.members
        if username == hostname:
            host = True
        elif(username in members):
            member = True
    else:
        username = None 
    Event.objects.filter(id=event_id).delete()   
    return render(request,"app/completed.html",{"username":username,"host":host,"member":member})

def suggestpage(request):
    context= {}
    event_id = request.COOKIES.get('event_id')
    event = Event.objects.get(id=event_id)
    timezone = pytz.timezone('Asia/Kolkata')
    timer_start = event.event_time
    duration = str(event.event_duration.total_seconds())
    timer_start = timer_start.astimezone(timezone)
    timeStart = timer_start.isoformat()
    context["timer_start"] = timeStart
    context['duration']= duration
    return render(request,"app/suggested.html")

def create_slots():
    
    events = Event.objects.all()
    for e in events:
        event_id = e.id
        memberstr = e.members
        if memberstr:
            usernames = memberstr.split(",")
            for username in usernames:
                print(username)
                print(event_id)
                try:
                    user = User.objects.get(username=username)
                    slot, created = slots.objects.get_or_create(user=user, event_id=event_id)
                    if created:
                        print(f"Slot for user {username} and event {event_id} created.")
                    else:
                        print(f"Slot for user {username} and event {event_id} already exists.")
                except User.DoesNotExist:
                    print(f"User with username {username} does not exist.")
                except IntegrityError as e:
                    print(f"IntegrityError: {e} for user {username} and event {event_id}.")




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


def admin(request):
    context = {}
    event_id = request.COOKIES.get('event_id')
    event = Event.objects.get(id=event_id)
    timezone = pytz.timezone('Asia/Kolkata')
    timer_start = event.event_time
    duration = str(event.event_duration.total_seconds())
    timer_start = timer_start.astimezone(timezone)
    timeStart = timer_start.isoformat()
    context["timer_start"] = timeStart
    context['duration']= duration
    username = request.user.username
    context['username'] = username
    return render(request,"app/admin.html",context)


def editEvent(request):
    context = {}
    event_id = request.COOKIES.get('event_id')
    event = Event.objects.get(id=event_id)
    timezone = pytz.timezone('Asia/Kolkata')
    timer_start = event.event_time
    duration = str(event.event_duration.total_seconds())
    timer_start = timer_start.astimezone(timezone)
    timeStart = timer_start.isoformat()
    context["timer_start"] = timeStart
    context['duration']= duration
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
        context['image_url'] = image_url
        context['logged_in'] = logged_in
    return render(request,"app/editevent.html",context)

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
    context = {}
    event_id = request.COOKIES.get('event_id')
    event = Event.objects.get(id=event_id)
    timezone = pytz.timezone('Asia/Kolkata')
    timer_start = event.event_time
    duration = str(event.event_duration.total_seconds())
    timer_start = timer_start.astimezone(timezone)
    timeStart = timer_start.isoformat()
    context["timer_start"] = timeStart
    context['duration']= duration
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
    person = request.user.username
    context['image_url'] = image_url
    context['person'] = person
    context['logged_in'] = logged_in
    return render(request,"app/notifications.html",)

def slotspg(request):
    context = {}
    event_id = request.COOKIES.get('event_id')
    event = Event.objects.get(id=event_id)
    timezone = pytz.timezone('Asia/Kolkata')
    timer_start = event.event_time
    duration = str(event.event_duration.total_seconds())
    timer_start = timer_start.astimezone(timezone)
    timeStart = timer_start.isoformat()
    context["timer_start"] = timeStart
    context['duration']= duration
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
    context['image_url'] = image_url
    context['host'] = host
    context['logged_in'] = logged_in
    return render(request,"app/slots.html",context)



def roles(request):
    context = {}
    event_id = request.COOKIES.get('event_id')
    event = Event.objects.get(id=event_id)
    timezone = pytz.timezone('Asia/Kolkata')
    timer_start = event.event_time
    duration = str(event.event_duration.total_seconds())
    timer_start = timer_start.astimezone(timezone)
    timeStart = timer_start.isoformat()
    context["timer_start"] = timeStart
    context['duration']= duration
    logged_in = False
    image_url = None
    if request.user.is_authenticated:
        logged_in =True
        
       
        social_account = SocialAccount.objects.get(user=request.user)
        data = social_account.extra_data
        image_url = data.get('picture')
    context['image_url'] = image_url
    
    context['logged_in'] = logged_in
    return render(request,"app/roles.html",context)



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
    event = Event.objects.get(id=event_id)
    

    try:
        
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
    event = Event.objects.get(id=event_id)
    timezone1 = pytz.timezone('Asia/Kolkata')
    timer_start = event.event_time
    duration = str(event.event_duration.total_seconds())
    timer_start = timer_start.astimezone(timezone1)
    timeStart = timer_start.isoformat()
    context["timer_start"] = timeStart
    context['duration']= duration
    print(timer_start)
    print(datetime.now())
    if timezone.now() >= timer_start:
        context['live'] = True
    
        
    user = request.user
    
    
    if user.groups.filter(name=f"Add Members{event_id}").exists():
        context["1v"] = True
    if user.groups.filter(name=f"Allow Noti{event_id}").exists():
        context["2v"] = True
    if user.groups.filter(name=f"Remove Members{event_id}").exists():
        context["3v"] = True
    if user.groups.filter(name=f"Edit Event{event_id}").exists():
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
        """Fetch the slot for the current user and event, or None if not found."""
        try:
            return slots.objects.get(user=self.request.user, event_id=self.kwargs['Event_id'])
        except slots.DoesNotExist:
            return None

    def update(self, request, *args, **kwargs):
        event_id = kwargs.get('Event_id')
        # Try to retrieve the slot
        instance = self.get_object()

        if instance is None:
            # Slot does not exist, so create a new one
            instance = slots.objects.create(
                user=self.request.user,
                event_id=event_id,
                slots=request.data.get('slots', {})
            )
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        else:
            # Update existing slot
            instance.slots = request.data.get('slots', {})
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)

        



class EventSerializerAPIView(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class EventDetailSerializerAPIView(generics.RetrieveUpdateDestroyAPIView):
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
        create_slots()
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
    


class tableSlotAPIView(generics.RetrieveDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = tableSlotSerializer

    def get_serializer_context(self):
        context= super().get_serializer_context()
        context.update({
            'request': self.request,
            'id':self.kwargs.get('pk')
        })
        return context

class CompletedEventsSerializerView(generics.CreateAPIView):
    queryset = completedEvents.objects.all()
    serializer_class = CompletedEventsSerializer

    def create(self, request, *args, **kwargs):
        
        data = request.data
        print(f"reqeust{data}")
        data = request.data
        print(f'kwargs{kwargs}')
        event_id  = kwargs.get('event_id')
        
        wb = Workbook()
        ws = wb.active
        ws.title = f'Event_Report-{event_id}'
        
        ws.append(['Username','Room','Time_Spent','Total_Work_Time'])
        row=2
        for username,user_data in data.items():
            records = user_data.get('records', [])
            n = len(records)
            total_time = sum(record.get('time_spent',0) for record in records)
            ws.merge_cells(start_row=row,start_column=1,end_row=row+n-1,end_column=1)
            ws.merge_cells(start_row=row,start_column=4,end_row=row+n-1,end_column=4)
            ws.cell(row=row,column=1,value=username)
            ws.cell(row=row,column=4,value=total_time)
            for record in records:
                ws.cell(row=row,column=2,value=record['room'])
                ws.cell(row=row,column=3,value=record['time_spent'])
                row+=1
        
        excel_file = io.BytesIO()
        wb.save(excel_file)
        excel_file.seek(0)

        event = Event.objects.get(id=event_id)
        model, created = completedEvents.objects.get_or_create(
            id=event_id, 
            defaults={
                'event_id': event_id,
                'host': event.host.username,
                'Event_name': event.Event_name,
                'members': event.members,
            }
        )
        model.save()
        file_name = f'Event_Records.xlsx'
        model.excel.save(file_name,ContentFile(excel_file.read()))
        
        
        event = Event.objects.get(id=event_id)
        

        serializer = self.get_serializer(model)
        return Response(serializer.data)
    
    
    
        



class CompletedEventGetAPIView(generics.RetrieveAPIView):
    queryset = completedEvents.objects.all()
    serializer_class = CompletedEventsSerializer

    def get(self,request,*args,**kwargs):
        
        boolean = kwargs.get('boolean')
        username = kwargs.get('username')
        if boolean ==1:
            ##1 is hosted
            queryset = completedEvents.objects.filter(host=username)
                
            
        if boolean ==0:
            ##0 for joined
            queryset = completedEvents.objects.filter(members__icontains=username)
            
        else:
            queryset = completedEvents.objects.none()

        for event in queryset:
            if event.excel:
                return FileResponse(event.excel, as_attachment=True, filename=f'Event_Records-{event.event_id}.xlsx')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
            
    
class TableView(APIView):
    table_storage = {}  

    def get(self, request, event_id, *args, **kwargs):
        
        current_table = self.table_storage.get(event_id, {})
        serializer = CurrentTableSerializer({'table': current_table})
        return Response(serializer.data)

    def post(self, request, event_id, *args, **kwargs):
        
        serializer = CurrentTableSerializer(data=request.data)
        if serializer.is_valid():
            self.table_storage[event_id] = serializer.validated_data['table']
            return Response({"message": "Table data updated successfully."})
        return Response(serializer.errors)


class RealTableView(generics.CreateAPIView):
    queryset = RealTable.objects.all()
    serializer_class = RealTableSerializer

    def post(self, request, *args, **kwargs):
        event_id = kwargs.get('event_id')
        username = kwargs.get('username')
        data = request.data
        print(f"Data for Real Table: {data}")

        try:
            instance = RealTable.objects.get(event_id=event_id)
        except RealTable.DoesNotExist:
            
            instance = RealTable(event_id=event_id, table={})
        
        table = instance.table or {}

        if username not in table:
            table[username] = {'records': []}
        
        for record in data.get(username, {}).get('records', []):
            table[username]['records'].append(record)
        
        instance.table = table
        instance.save()
        
        serializer = RealTableSerializer(instance)
        return Response(serializer.data)

    def get(self, request, *args, **kwargs):
        event_id = kwargs.get('event_id')
        try:
            table = RealTable.objects.get(event_id=event_id)
            serializer = RealTableSerializer(table)
            return Response(serializer.data)
        except RealTable.DoesNotExist:
            return Response({"error": "RealTable does not exist"}, status=404)

