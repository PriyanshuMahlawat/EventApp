from .models import Event
from django import forms
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta 

class EventForm(forms.ModelForm):
    event_time = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={'type': 'datetime-local', 'class': 'form-control'}),
        label="Event Time"
    )
    
    event_duration = forms.DurationField(
        widget=forms.TextInput(attrs={'type': 'text', 'class': 'form-control', 'placeholder': 'Enter duration (e.g., 2:00:00 for 2 hours)'}),
        label="Event Duration"
    )

    class Meta:
        model = Event
        exclude = ['create_time', 'host', 'members']
        labels = {
            'Event_Thumbnail': "Photo is Optional",
        }
        widgets = {
            'Event_name': forms.TextInput(attrs={'class': 'form-control'}),
            'Event_Thumbnail': forms.ClearableFileInput(attrs={'class': 'form-control-file'}),
            'rooms': forms.TextInput(attrs={'class': 'form-control'}),
            'Detail': forms.Textarea(attrs={'class': 'form-control'}),
        }

    def save(self, commit=True, user=None):
        event = super().save(commit=False)
        if user:
            event.host = user
            commit = True
        if commit:
            event.save()
        return event
    
    def clean_event_time(self):
        event_time = self.cleaned_data.get('event_time')
        if event_time.date() <= timezone.now().date():
            raise ValidationError("The event date isn't valid. Please choose a different date.")
        
        if event_time<=timezone.now()+timedelta(minutes=5):
            raise ValidationError("The event time is not valid.Keep it atleast 5 mins from now.")
        return event_time
    
    