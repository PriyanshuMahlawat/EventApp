from rest_framework import serializers
from .models import Event,Notifications,CurrentEvent,slots
from django.contrib.auth.models import Group, User, Permission
from django.contrib.contenttypes.models import ContentType

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