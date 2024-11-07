document.addEventListener("DOMContentLoaded", async function() {
    const EventName = document.getElementById("event-name");
    const hostName = document.getElementById("host-name");
    let EventId;

    async function getid(){
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


    //event ends
    
  // Retrieve timer start and duration from the HTML
const timerStartStr = document.getElementById('timer-start').dataset.value;
const timerDuration = parseFloat(document.getElementById('timer-duration').dataset.value);

console.log("Timer Start String:", timerStartStr);
console.log("Timer Duration (seconds):", timerDuration);

const timerStart = new Date(timerStartStr);
console.log("Timer Start:", timerStart);

if (!isNaN(timerStart.getTime()) && !isNaN(timerDuration)) {
    const endTime = new Date(timerStart.getTime() + timerDuration * 1000); // Convert duration to milliseconds
    console.log("End Time:", endTime);
    const now = new Date();
    let remainingTime = endTime - now;
    console.log("Remaining Time (ms):", remainingTime);

    function redirectPage() {
        document.getElementById('modalOuterEndEvent').style.display = 'block';
        document.getElementById('check-report-btn').addEventListener("click", function () {
            window.location.href = 'http://localhost:8000/completedEvents/';
        });
    }

    if (remainingTime > 0) {
        setTimeout(redirectPage, remainingTime);
    } else {
        redirectPage();
    }
} else {
    console.error("Invalid date or duration");
}




    
});