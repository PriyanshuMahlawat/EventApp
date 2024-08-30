from .models import Event
from django import forms

class EventForm(forms.ModelForm):
    event_time = forms.DateTimeField(
        widget=forms.DateTimeInput(attrs={'type': 'datetime-local', 'class': 'form-control'}),
        label="Event Time"
    )

    class Meta:
        model = Event
        exclude = ['create_time', 'host', 'members']
        labels = {
            'Event_Thumbnail': "Photo is Optional",
            'rooms': 'Ex: J107,G102,F107,NFG,OFG,etc...',
            'Detail': 'Optional but recommended',
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