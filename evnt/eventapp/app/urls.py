from django.urls import path
from . import views



urlpatterns = [
    
    path("",views.index,name="index"),
    path("host/",views.hostpg,name="host"),
    path("popup/",views.popup_view,name="popup"),
    path("notifications/",views.noti,name="notipg"),
    path("myevents/",views.myeventtab,name="myevent"),
    path("about/",views.about,name="about"),
    path("roles/",views.roles,name="roles"),
    path("manage/slots/",views.slotspg,name="slots"),
    path("detail/",views.DetailEvent,name="eventdetail"),
    path("completedEvents/",views.completedpage,name="completedpage"),
    path('liveadmin/',views.admin,name='adminpage'),
    path("manageEvent/",views.manage,name="manageEvent"),
    path("manageEvent/editEvent/",views.editEvent,name="editEvent"),
    path("suggested/",views.suggestpage,name="suggested"),
    path("slotnoti/",views.slotnoti,name="slotnoti"),
    path('api/slots/<int:Event_id>/',views.SlotsDetailAPIView.as_view(),name='slotsapi'),
    path("api/eventlist/",views.EventSerializerAPIView.as_view(),name="eventlistapi"),
    path("api/<int:pk>/",views.EventDetailSerializerAPIView.as_view(),name="detailapi"),
    path("api/noti/",views.NotiSerializerAPIView.as_view(),name="noti"),
    path("api/id/",views.CurrentEventAPIView.as_view(),name="id"),
    path("api/notidel/<int:pk>/",views.NotiDestroyUpdateView.as_view(),name="notidel"),
    path("api/host/",views.HostedEventSerializerAPIView.as_view(),name="hosted"),
    path("api/hostdel/<int:pk>/",views.HostedEventsUpdateDestroyAPIView.as_view(),name="hotdel"),
    path("api/addmembers/<int:pk>/",views.AddmembersAPIView.as_view(),name="addmembers"),
    path("api/memberlist/<int:pk>/",views.membersRetrieveAPIView.as_view(),name ="memberslist"),
    path("api/memberlistupdate/<int:pk>/",views.membersUpdateAPIView.as_view(),name ="memberslistupdate"),
    path("api/joined/",views.JoinedAPIView.as_view(),name='joined'),
    path("api/leaveevent/<int:event_id>/",views.LeaveEventAPIView.as_view(),name='leave_event'),
    path("api/manageevent/<int:pk>/",views.ManageEventAPI.as_view(),name="manageEvent"),
    path("api/tableslots/<int:pk>/",views.tableSlotAPIView.as_view(),name="tableSlots"),
    path("api/excelSheets/<int:event_id>/",views.CompletedEventsSerializerView.as_view(),name="excel"),
    path('api/currenttable/<int:event_id>/',views.TableView.as_view(), name='table-view'),
    path("api/completed/get/",views.CompletedEventGetAPIView.as_view(),name="completedEvents"),
    path("api/realTable/<str:username>/<int:event_id>/",views.RealTableView.as_view(),name="realTableAPI"),
    path("api/finaltable/<int:pk>/",views.FinalTableAPIView.as_view(),name="finalTable"),
    path("api/tablemodify/<int:pk>/",views.TableModificationsAPIView.as_view(),name="modifyTable"),
]