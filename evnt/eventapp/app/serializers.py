from rest_framework import serializers
from .models import Event,Notifications,CurrentEvent,slots
from django.contrib.auth.models import Group, User

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
        permissionString = validated_data.get('permission')
        commaIndex = permissionString.find('-')
        if commaIndex != -1:
            username0 = permissionString[:commaIndex]
            roleString = permissionString[commaIndex +1:]
        print(username0)
        print(roleString)
        user = User.objects.get(username = username0)
        print(user.first_name)    
        if roleString:
            if '1' in roleString:
                group, created  = Group.objects.get_or_create(name='Add Members')
                user.groups.add(group)
            if '2' in roleString:
                group, created  = Group.objects.get_or_create(name='Allow Noti')
                user.groups.add(group)
            if '3' in roleString:
                group, created  = Group.objects.get_or_create(name='Remove Members')
                user.groups.add(group)
            if '4' in roleString:
                group, created  = Group.objects.get_or_create(name='Edit Event')
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
        if request:
            joined_Events = []
            user_name = request.user.username
            for e in Event.objects.all():
                if e.members and user_name in e.members:
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