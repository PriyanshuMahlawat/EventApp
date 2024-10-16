from django.contrib import admin
from .models import Event,Notifications,slots,CurrentEvent,completedEvents,RealTable,FinalSlotsTable,tablemodifications


admin.site.register(Event)
admin.site.register(Notifications)
admin.site.register(slots)
admin.site.register(CurrentEvent)
admin.site.register(completedEvents)
admin.site.register(RealTable)
admin.site.register(FinalSlotsTable)
admin.site.register(tablemodifications)














