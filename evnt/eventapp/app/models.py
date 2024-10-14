from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Event(models.Model):
    host = models.ForeignKey(User,on_delete=models.CASCADE)
    Event_name = models.CharField(blank=False,max_length=150)
    Event_Thumbnail = models.ImageField(upload_to="EventPhotos/",blank = True,null=True,default='EventPhotos/def2.webp')
    create_time = models.DateTimeField(auto_now_add=True)
    event_time = models.DateTimeField(blank=False)
    event_duration = models.DurationField(blank=False)
    rooms = models.CharField(blank=False,max_length=1000)
    Detail = models.TextField(blank=True,null=True)
    members = models.CharField(max_length=10000,null=True)

    def __str__(self):
        return self.Event_name
        
    def host_name(self):
        return self.host.first_name
        
        
class Notifications(models.Model):
    Event = models.ForeignKey(Event,on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=50)
    create_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


   
class CurrentEvent(models.Model):
    user = models.OneToOneField(User, on_delete=models.DO_NOTHING)
    event_id = models.IntegerField(null=True, blank=True)
       
class slots(models.Model):
    user = models.ForeignKey(User,on_delete=models.DO_NOTHING)
    event_id = models.IntegerField(null=True,blank=True)
    slots = models.JSONField(blank=True,null=True)


class completedEvents(models.Model):
    id = models.AutoField(primary_key=True)
    excel= models.FileField(upload_to='excelSheets/')
    event_id = models.IntegerField()
    host = models.CharField(max_length=100)
    Event_name = models.CharField(blank=False,max_length=150)
    members = models.CharField(max_length=10000,null=True)


class RealTable(models.Model):
    event_id = models.IntegerField(unique=True)
    table = models.JSONField()


class FinalSlotsTable(models.Model):
    Event = models.OneToOneField(Event, on_delete=models.CASCADE)
    excel_file = models.FileField(upload_to='finaltable/', blank=True, null=True)

    
    
    @property
    def download_url(self):
        if self.excel_file:
            return self.excel_file.url
        return None

    