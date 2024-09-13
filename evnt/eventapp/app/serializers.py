from rest_framework import serializers
from .models import Event,Notifications,CurrentEvent,slots,completedEvents,RealTable
from django.contrib.auth.models import Group, User, Permission
from django.contrib.contenttypes.models import ContentType
from datetime import datetime
import pytz

class EventSerializer(serializers.ModelSerializer):
    host_name = serializers.SerializerMethodField()
    roomArr  = serializers.SerializerMethodField()
    class Meta:
        model = Event
        fields = ['host_name','id','Event_name','event_time','roomArr','Event_Thumbnail']

    def get_host_name(self,obj):
        return obj.host.username
    
    def get_roomArr(self,obj):
        roomArr = obj.rooms.replace(" ","")
        roomArr = roomArr.split(",")
        return roomArr


class slotsSerializer(serializers.ModelSerializer):

    class Meta:
        model = slots
        fields = ['user','event_id','slots']
        read_only_fields = ['user']
    


class EventDetailSerializer(serializers.ModelSerializer):
    host_name = serializers.SerializerMethodField()
    roomArr  = serializers.SerializerMethodField()
    class Meta:
        model = Event
        fields = ['host_name','id','Event_name','event_time','roomArr','Detail','Event_Thumbnail','create_time']

    def get_host_name(self,obj):
        return obj.host.username
    
    def get_roomArr(self,obj):
        roomArr = obj.rooms.replace(" ","")
        roomArr = roomArr.split(",")
        return roomArr
    


class AddingMembersSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Event
        fields = ['members']


class MembersListSerializer(serializers.ModelSerializer):
    permission = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    class Meta:
        model = Event 
        fields = ['id','members','permission']  

    def update(self,instance,validated_data):
        print(validated_data)
        permissionString = validated_data.get('permission')
        former = permissionString.split(':')[0]
        id = permissionString.split(':')[1]
        username0 = former.split('-')[0]
        roleString = former.split('-')[1]
        
        
        
        user = User.objects.get(username=username0)
        
          
        if roleString:
            event_content_type = ContentType.objects.get_for_model(Event)
            if '1' in roleString:
                group, created  = Group.objects.get_or_create(name=f'Add Members{id}')
                perms = ['add_event','view_event','add_notifications','view_notifications','delete_notifications','change_notifications']
                for perm in perms:

                    permission = Permission.objects.get(codename =perm,content_type=event_content_type ) 
                    group.permissions.add(permission)

                group.save()
                user.groups.add(group)
            if '2' in roleString:
                group, created  = Group.objects.get_or_create(name=f'Allow Noti{id}')
                perms = ['add_event','view_event']
                for perm in perms:

                    permission = Permission.objects.get(codename =perm,content_type=event_content_type ) 
                    group.permissions.add(permission)

                group.save()                
                user.groups.add(group)
            if '3' in roleString:
                group, created  = Group.objects.get_or_create(name=f'Remove Members{id}')
                perms = ['add_event','view_event']
                for perm in perms:

                    permission = Permission.objects.get(codename =perm,content_type=event_content_type ) 
                    group.permissions.add(permission)

                group.save()
                user.groups.add(group)
            if '4' in roleString:
                group, created  = Group.objects.get_or_create(name=f'Edit Event{id}')
                perms = ['add_event','view_event','change_event','delete_event']
                for perm in perms:

                    permission = Permission.objects.get(codename =perm,content_type=event_content_type ) 
                    group.permissions.add(permission)

                group.save()
                user.groups.add(group) 
                

            user.save()
        return instance  



class NotiSerializer(serializers.ModelSerializer):
    Event_id = serializers.IntegerField() 

    class Meta:
        model = Notifications
        fields = ['name', 'create_time', 'Event_id','id']

    def create(self, validated_data):
        event_id = validated_data.pop('Event_id')  
        event = Event.objects.get(id=event_id) 
        notification = Notifications.objects.create(Event=event, **validated_data)  
        return notification 

    def validate_Event_id(self, value):
        if value is None:
            raise serializers.ValidationError("Event_id is required.")
        return value 


class HostedEventsSerializer(serializers.ModelSerializer):
    eve_names = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['eve_names']

    def get_eve_names(self, obj):
        request = self.context.get('request')
        if request:
            
            hosted_events = Event.objects.filter(host__username=request.user.username)
            
            eve_names = []
            for event in hosted_events:
                event_info = {
                            'id': event.id,
                            'Event_name': event.Event_name
                            }
                eve_names.append(event_info)
            return eve_names
        return []       
    

class JoinedEventsSerializer(serializers.ModelSerializer):
    joined_Events = serializers.SerializerMethodField()
    class Meta:
        model=Event
        fields= ['joined_Events']    

    def get_joined_Events(self,obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            joined_Events = []
            user_name = request.user.username
            for e in Event.objects.all():
                
                memberStr = e.members
                memberArray = memberStr.split(",")
                boo = user_name in memberArray
                if e.members and boo:
                    joined_Events.append({
                    'id': e.id,
                    'Event_name': e.Event_name
                    })
            return joined_Events        

        return []
    

class ManageEventSerializer(serializers.ModelSerializer):
    
    host_name = serializers.SerializerMethodField()
    roomArr  = serializers.SerializerMethodField()
    class Meta:
            model = Event
            fields = ['host_name','id','Event_name','event_time','roomArr','Event_Thumbnail']

    def get_host_name(self,obj):
            return obj.host.username
        
    def get_roomArr(self,obj):
            roomArr = obj.rooms.replace(" ","")
            roomArr = roomArr.split(",")
            return roomArr



class CurrentEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CurrentEvent
        fields = ['event_id']


class CompletedEventsSerializer(serializers.ModelSerializer):
    
    class Meta:
        model =completedEvents
        fields = ['excel','event_id','Event_name']

        





class tableSlotSerializer(serializers.ModelSerializer):
    slot = serializers.SerializerMethodField()
    class Meta:
        model = Event
        fields = ['slot']

    def get_slot(self,obj):
        
        event_id = self.context.get('id')
        event = Event.objects.get(id=event_id)
        roomsArr = event.rooms.split(',')
        EstartTime = event.event_time
        EendTime = EstartTime + event.event_duration
        eventSlots = slots.objects.filter(event_id=event_id)
        timezone = pytz.timezone('Asia/Kolkata')
        
        
        EstartTime = EstartTime.astimezone(timezone)
        
        EendTime = EendTime.astimezone(timezone)
        tableSlot = {}
        remaining_event_slots = list(eventSlots)

        for room in roomsArr:
            tableSlot[room] = []  
            tableSlot[room].append({None: (EstartTime, EendTime)})
            
            for slot in remaining_event_slots:
                
                for key, time in slot.slots.items():
                    username = slot.user.username
                    starttime_str, endTime_str = time.strip('()').split(',')
                    starttime = datetime.strptime(starttime_str.strip(), '%H:%M')
                    endTime = datetime.strptime(endTime_str.strip(), '%H:%M')
                    if starttime.tzinfo is None:
                        starttime = timezone.localize(starttime)
                    if endTime.tzinfo is None:
                        endTime = timezone.localize(endTime)



                    if starttime == EstartTime and tableSlot[room][0].get(None):                        
                        tableSlot[room][0] = {username: (starttime.time(), endTime.time())}
                        

                    elif (
                        starttime != EstartTime 
                        and list(tableSlot[room][0].keys())[0] is None 
                        and len(tableSlot[room])==1
                    ):       
                        
                        tableSlot[room].insert(1, {username: (starttime, endTime)})
                        
                    
                    elif starttime != EstartTime:
                        print("this")
                        
                        tableSlot[room].append({username: (starttime, endTime)})
                remaining_event_slots.remove(slot)        
            
            
            last_slot = tableSlot[room][-1]
            last_end_time = last_slot.get(list(last_slot.keys())[0])[1]
           
            
            if last_end_time < EendTime:
                
                
                tableSlot[room].append({None: (last_end_time, EendTime)})
                
            
                
        return tableSlot

    
        
class CurrentTableSerializer(serializers.Serializer):
    table = serializers.DictField(child=serializers.ListField(child=serializers.CharField()), allow_empty=True)

class RealTableSerializer(serializers.ModelSerializer):
   class Meta:
       model = RealTable
       fields = ['event_id','table']

    


    
        