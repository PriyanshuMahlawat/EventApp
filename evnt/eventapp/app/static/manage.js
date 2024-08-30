document.addEventListener("DOMContentLoaded", async function() {
    const EventName = document.getElementById("event-name");
    const hostName = document.getElementById("host-name");
    let EventId;

    async function getid() {
        try {
            const response = await fetch("http://localhost:8000/api/id/");
            const data = await response.json();
            EventId = data.event_id;
        } catch (error) {
            console.error("Error:", error);
        }
    }
    
    await getid();
    
    if (EventId) {
        fetch(`http://localhost:8000/api/${EventId}/`)
        .then(response => response.json())
        .then(data => {
            EventName.textContent = data.Event_name;
            hostName.textContent += data.host_name;
        })
        .catch(error => {
            console.error("Error:", error);
        });
    } else {
        console.error("EventId not found.");
    }
});