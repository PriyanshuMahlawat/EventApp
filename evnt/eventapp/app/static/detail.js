document.addEventListener("DOMContentLoaded", async function() {
    const eventName = document.getElementById("event-name");
    const hostName = document.getElementById("host-name");
    const eventTime = document.getElementById("event-time");
    const rooms = document.getElementById("rooms");
    const detail = document.getElementById("detail");
    const createTime = document.getElementById("create-time");
    const eventThumbnail = document.getElementById("event-thumbnail");

    let id;

    async function getid(){
        try{
            const response = await fetch("http://localhost:8000/api/id");
            const data = await response.json()
            id = data.event_id;
        }
        catch(error){
            console.error("Error:",error);
        }
         
    }
    await getid();
    if(id){
        fetch(`http://localhost:8000/api/${id}/`)
        .then(response => response.json())
        .then(data => {
            eventName.textContent = data.Event_name;
            hostName.textContent = data.host_name;
            eventTime.textContent = new Date(data.event_time).toLocaleString();
            rooms.textContent = data.roomArr.join(", ");
            detail.textContent = data.Detail;
            createTime.textContent = new Date(data.create_time).toLocaleString();
            eventThumbnail.src = data.Event_Thumbnail;
    })
    .catch(error => {
        console.error("Error:", error);
    });
    }
    
});
