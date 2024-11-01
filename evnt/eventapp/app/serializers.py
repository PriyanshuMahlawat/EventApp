from rest_framework import serializers
from .models import Event,Notifications,CurrentEvent,slots,completedEvents,RealTable,FinalSlotsTable,tablemodifications
from django.contrib.auth.models import Group, User, Permission
from django.contrib.contenttypes.models import ContentType
from datetime import datetime
from datetime import timedelta
import pytz

class EventSerializer(serializers.ModelSerializer):
    host_name = serializers.SerializerMethodField()
    roomArr  = serializers.SerializerMethodField()
    class Meta:
        model = Event
        fields = ['host_name','id','Event_name','event_time','roomArr','Event_Thumbnail','members']

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
        fields = ['host_name','id','Event_name','event_time','roomArr','Detail','Event_Thumbnail','create_time','event_duration']

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
        
 
        event_content_type = ContentType.objects.get_for_model(Event)
        notifications_content_type = ContentType.objects.get_for_model(Notifications)
        if roleString:
            if '1' in roleString:
                group, created = Group.objects.get_or_create(name=f'Add Members{id}')
                
                # Permissions for both Event and Notifications models
                perms = [
                    ('add_event', event_content_type), 
                    ('view_event', event_content_type), 
                    ('add_notifications', notifications_content_type), 
                    ('view_notifications', notifications_content_type), 
                    ('delete_notifications', notifications_content_type), 
                    ('change_notifications', notifications_content_type)
                ]
                
                # Assign permissions based on model's content type
                for perm, content_type in perms:
                    permission = Permission.objects.get(codename=perm, content_type=content_type)
                    group.permissions.add(permission)
                
                group.save()
                user.groups.add(group)

            if '2' in roleString:
                group, created = Group.objects.get_or_create(name=f'Allow Noti{id}')
                
                # Only Event-related permissions
                perms = [
                    ('add_event', event_content_type), 
                    ('view_event', event_content_type)
                ]
                
                for perm, content_type in perms:
                    permission = Permission.objects.get(codename=perm, content_type=content_type)
                    group.permissions.add(permission)
                
                group.save()
                user.groups.add(group)

            if '3' in roleString:
                group, created = Group.objects.get_or_create(name=f'Remove Members{id}')
                
                # Only Event-related permissions
                perms = [
                    ('add_event', event_content_type), 
                    ('view_event', event_content_type)
                ]
                
                for perm, content_type in perms:
                    permission = Permission.objects.get(codename=perm, content_type=content_type)
                    group.permissions.add(permission)
                
                group.save()
                user.groups.add(group)

            if '4' in roleString:
                group, created = Group.objects.get_or_create(name=f'Edit Event{id}')
                
                # Only Event-related permissions
                perms = [
                    ('add_event', event_content_type), 
                    ('view_event', event_content_type), 
                    ('change_event', event_content_type), 
                    ('delete_event', event_content_type)
                ]
                
                for perm, content_type in perms:
                    permission = Permission.objects.get(codename=perm, content_type=content_type)
                    group.permissions.add(permission)
                
                group.save()
                user.groups.add(group)
        else:
            groups = user.groups.all()
    
   
            for group in groups:
                group.permissions.clear()  # Clear all permissions from the group
                user.groups.remove(group) 

                

            user.save()
        return instance  



class NotiSerializer(serializers.ModelSerializer):
    Event_id = serializers.IntegerField() 

    class Meta:
        model = Notifications
        fields = ['name', 'create_time', 'Event_id','id']

    def create(self,validated_data):
        name = validated_data.get('name')
        event_id = validated_data.get('Event_id')
        event = Event.objects.get(id=event_id)
        existing_members = event.members.split(',') if event.members else []
        if name in existing_members:
            raise serializers.ValidationError({"detail": "Name is not a member of the event."})
        
        
        notification,created=Notifications.objects.get_or_create(Event=event,name=name) 
        return notification
         


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
                if memberStr:
                    memberArray = memberStr.split(",")
                else:
                    memberArray = []
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

        
class tablemodificationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = tablemodifications
        fields =['table','changes']



class FinalSlotsSerializer(serializers.ModelSerializer):
    download_url = serializers.ReadOnlyField()
    class Meta:
        model = FinalSlotsTable
        fields = ['id', 'Event','excel_file', 'download_url']
        


class tableSlotSerializer(serializers.ModelSerializer):
    slot = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['slot']

    def get_slot(self, obj):
        event_id = self.context.get('id')
        event = Event.objects.get(id=event_id)
        
        roomsArr = event.rooms.split(',')
        EstartTime = event.event_time
        EendTime = EstartTime + event.event_duration
        eventSlots = slots.objects.filter(event_id=event_id)
        timezone = pytz.timezone('Asia/Kolkata')
        print(eventSlots)
        EstartTime = EstartTime.astimezone(timezone)
        EendTime = EendTime.astimezone(timezone)
        tableSlot = {room: [] for room in roomsArr}
        remaining_event_slots = list(eventSlots)

        def get_start_time(slot):
            
            if slot.slots:
                for key, time in slot.slots.items():
                    starttime_str, _ = time.strip('()').split(',')
                    starttime = datetime.strptime(starttime_str.strip(), '%H:%M')
                    if starttime.tzinfo is None:
                        starttime = timezone.localize(starttime)
                    return starttime
            return None

        remaining_event_slots.sort(key=get_start_time)

        room_index = 0
        while remaining_event_slots:
            room = roomsArr[room_index]
            slot = remaining_event_slots.pop(0)

            if slot.slots:
                for key, time in slot.slots.items():
                    username = slot.user.username
                    starttime_str, endTime_str = time.strip('()').split(',')
                    starttime = datetime.strptime(starttime_str.strip(), '%H:%M')
                    endTime = datetime.strptime(endTime_str.strip(), '%H:%M')

                    if starttime.tzinfo is None:
                        starttime = timezone.localize(starttime)
                    if endTime.tzinfo is None:
                        endTime = timezone.localize(endTime)
                    if starttime == EstartTime:
                        if tableSlot[room] and tableSlot[room][0].get(None):
                            tableSlot[room][0] = {username: (starttime.time(), endTime.time())}
                        else:
                            tableSlot[room].append({username: (starttime.time(), endTime.time())})

                    elif starttime != EstartTime:
                        if tableSlot[room]:
                            first_entry = tableSlot[room][0]
                            if list(first_entry.keys())[0] is None and len(tableSlot[room]) == 1:
                                tableSlot[room].insert(1, {username: (starttime.time(), endTime.time())})
                            else:
                                tableSlot[room].append({username: (starttime.time(), endTime.time())})
                        else:
                            tableSlot[room].append({username: (starttime.time(), endTime.time())})

                            

            room_index = (room_index + 1) % len(roomsArr)

        def get_time_only(datetime_obj):
            return datetime_obj.time() if isinstance(datetime_obj, datetime) else datetime_obj

        
       
        # Safety mechanism to prevent infinite loops
        MAX_RETRIES = 3


        retry_count = 0
        
        while retry_count < MAX_RETRIES:
            print(f"Retry {retry_count}: Checking for acceptable slots...")  # Debugging
            
            # Call slotOverlap and check if table is acceptable
            tableSlot, acceptable = self.slotOverlap(tableSlot, roomsArr)
            
            # Debugging: show tableSlot and acceptable state
            print(f"Table Slots: {tableSlot}")
            print(f"Is it acceptable? {acceptable}")
            
            # If the slots are acceptable, break the loop and clean the table
            if acceptable:
                print("Found acceptable slot configuration.")
                tableSlot = self.cleanTable(tableSlot, roomsArr)
                for room in roomsArr:
                    if tableSlot[room]:
                        first_slot = tableSlot[room][0]
                        last_slot = tableSlot[room][-1]

                        first_slot_startTime = get_time_only(first_slot.get(list(first_slot.keys())[0])[0])
                        last_end_time = get_time_only(last_slot.get(list(last_slot.keys())[0])[1])
                        event_start_time = get_time_only(EstartTime)
                        event_end_time = get_time_only(EendTime)

                        if last_end_time < event_end_time:
                            tableSlot[room].append({None: (last_end_time, event_end_time)})

                        if first_slot_startTime > event_start_time:
                            tableSlot[room].insert(0, {None: (event_start_time, first_slot_startTime)})
                    else:
                        tableSlot[room].append({None: (EstartTime.time(), EendTime.time())})
                return tableSlot
            
            retry_count += 1
        
        # If we hit the retry limit, raise an error or handle it appropriately
        raise Exception("Max retries reached. The slot configuration is stuck or invalid.")

        
            

        

    def cleanTable(self, table, rooms):
        for room in rooms:
            
            cleaned_slots = []
            
            for slot in table[room]:
            
                for key in slot:
                    if key is not None:
                        usernamesArr = key.split('_')
                        uniqueArr = list(set(usernamesArr))
                        
                        
                        cleaned_slot = {('_'.join(uniqueArr)): slot[key]}
                        cleaned_slots.append(cleaned_slot)
                    else:
                        cleaned_slot = {None: slot[key]}
                        cleaned_slots.append(cleaned_slot)  
            
            table[room] = cleaned_slots
        
        return table

                

    def slotOverlap(self, table, rooms):
        print(table)

        def time_to_seconds(time_obj):
            return time_obj.hour * 3600 + time_obj.minute * 60 + time_obj.second + time_obj.microsecond / 1_000_000

        
        newTable = {room: [] for room in rooms}
        
        for room in rooms:
            print("roomswitch")
            i = 0
            if not table.get(room):
                continue
            
            for slot in table[room]:
                
                current_key = next(iter(slot))
                if current_key is None:
                    print("check0")
                    newTable[room].append({None: slot[current_key]})
                    i += 1
                    continue
                
                NewstartTime, NewendTime = slot[current_key]
                username = current_key

                
                
                    
                overlap_handled = False
                    
                for k in range(i):
                        
                        prev_entry = newTable[room][k]
                        prev_key = next(iter(prev_entry))
                        PrevStartTime, PrevEndTime = prev_entry[prev_key]

                        print(f"prvstart:{PrevStartTime},prevend:{PrevEndTime},newstrt:{NewstartTime},newend:{NewendTime}")
                        
                        # All time comparisons now use time_to_seconds
                        if time_to_seconds(NewstartTime) == time_to_seconds(PrevStartTime) and \
                                time_to_seconds(NewendTime) < time_to_seconds(PrevEndTime):
                            print("check1")
                            newTable[room][k] = {f"{prev_key}_{username}": (NewstartTime, NewendTime)}
                            newTable[room].insert(k+1, {prev_key: (NewendTime, PrevEndTime)})
                            overlap_handled = True
                            
                            
                            i += 1
                            break

                        elif time_to_seconds(NewstartTime) == time_to_seconds(PrevStartTime) and \
                                time_to_seconds(NewendTime) > time_to_seconds(PrevEndTime):
                            print("check2")
                            newTable[room][k] = {f"{prev_key}_{username}": (PrevStartTime, PrevEndTime)}
                            newTable[room].insert(k+1, {f"{username}": (PrevEndTime, NewendTime)})
                            overlap_handled = True
                            
                            break
                            i += 1

                        elif time_to_seconds(NewstartTime) == time_to_seconds(PrevStartTime) and \
                                time_to_seconds(NewendTime) == time_to_seconds(PrevEndTime):
                            print("check3")
                            newTable[room][k] = {f"{prev_key}_{username}": (NewstartTime, NewendTime)}
                            overlap_handled = True
                            break

                        elif time_to_seconds(NewstartTime) > time_to_seconds(PrevStartTime) and \
                                time_to_seconds(NewstartTime) < time_to_seconds(PrevEndTime):

                            if time_to_seconds(NewendTime) < time_to_seconds(PrevEndTime):
                                print("check4")
                                newTable[room][k] = {f"{prev_key}": (PrevStartTime, NewstartTime)}
                                newTable[room].insert(k+1, {f"{prev_key}_{username}": (NewstartTime, NewendTime)})
                                newTable[room].insert(k+2, {f"{prev_key}": (NewendTime, PrevEndTime)})
                                overlap_handled = True
                                
                                
                                i += 2
                                break

                            elif time_to_seconds(NewendTime) == time_to_seconds(PrevEndTime):
                                print("check5")
                                newTable[room][k] = {f"{prev_key}": (PrevStartTime, NewstartTime)}
                                newTable[room].insert(k+1, {f"{prev_key}_{username}": (NewstartTime, NewendTime)})
                                overlap_handled = True
                                
                                
                                i += 1
                                break

                            elif time_to_seconds(NewendTime) > time_to_seconds(PrevEndTime):
                                print("check6")
                                newTable[room][k] = {prev_key: (PrevStartTime, NewstartTime)}
                                newTable[room].insert(k+1, {f"{prev_key}_{username}": (NewstartTime, PrevEndTime)})
                                newTable[room].insert(k+2, {f"{username}": (PrevEndTime, NewendTime)})
                                overlap_handled = True
                                
                                i += 2
                                break
                                

                        elif time_to_seconds(NewstartTime) < time_to_seconds(PrevStartTime) and \
                                time_to_seconds(NewendTime) < time_to_seconds(PrevEndTime):
                            print("check7")
                            newTable[room][k] = {username: (NewstartTime, PrevStartTime)}
                            newTable[room].insert(k+1, {f"{prev_key}_{username}": (PrevStartTime, NewendTime)})
                            newTable[room].insert(k+2, {f"{prev_key}": (NewendTime, PrevEndTime)})
                            overlap_handled = True
                            
                            i += 2
                            break

                        elif time_to_seconds(NewstartTime) < time_to_seconds(PrevStartTime) and \
                                time_to_seconds(NewendTime) > time_to_seconds(PrevEndTime):
                            print("check8")
                            newTable[room][k] = {username: (NewstartTime, PrevStartTime)}
                            newTable[room].insert(k+1, {f"{prev_key}_{username}": (PrevStartTime, PrevEndTime)})
                            newTable[room].insert(k+2, {f"{username}": (PrevEndTime, NewendTime)})
                            overlap_handled = True
                            
                            i += 2
                            break
                        elif time_to_seconds(NewstartTime) < time_to_seconds(PrevStartTime) and \
                                time_to_seconds(NewendTime) == time_to_seconds(PrevEndTime):
                            print("check8")
                            newTable[room][k] = {username: (NewstartTime, PrevStartTime)}
                            newTable[room].insert(k+1, {f"{prev_key}_{username}": (PrevStartTime, PrevEndTime)})
                            
                            overlap_handled = True
                            
                            i += 1
                            break
                            

                if not overlap_handled:
                        print("check9")
                        newTable[room].append({username: (NewstartTime, NewendTime)})
                        i += 1
        acceptable = True
        for room in rooms:
            for i in range(len(newTable[room]) - 1):
                current_slot = newTable[room][i]
                next_slot = newTable[room][i+1]
                
                current_end = list(current_slot.values())[0][1]
                next_start = list(next_slot.values())[0][0]

                # Debugging: Print the current end and next start times
                print(f"Comparing: Current End = {current_end}, Next Start = {next_start}")
                
                if not time_to_seconds(current_end) <= time_to_seconds(next_start):
                    acceptable = False
                    print(f"Slots overlap! End: {current_end}, Start: {next_start}")
                    break

            if not acceptable:
                break

        
        return newTable, acceptable
    
    






class CurrentTableSerializer(serializers.Serializer):
    table = serializers.DictField(child=serializers.ListField(child=serializers.CharField()), allow_empty=True)

class RealTableSerializer(serializers.ModelSerializer):
   class Meta:
       model = RealTable
       fields = ['event_id','table']

    

class CompletedEventGetSerializer(serializers.Serializer):
    dict = serializers.DictField(child=serializers.ListField(child=serializers.CharField()), allow_empty=True)

    
        


