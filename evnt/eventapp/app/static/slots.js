document.addEventListener("DOMContentLoaded", async function() {
    let EtimePara = document.getElementById("E-time");
    let slotsDiv = document.getElementById("slot-div");
    let addSlotBtn = document.getElementById("add-slots");
    let submitSlotsBtn = document.getElementById("submit-slots");
    let name = document.getElementById("name").textContent;
    let Event_id;
    let lastEndTime = null;
    let duration = null;
    let eventStartTime = null;

    // Cookie helper function
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const csrftoken = getCookie('csrftoken');



    async function getid() {
        try {
            const response = await fetch("http://localhost:8000/api/id/");
            const data = await response.json();
            Event_id = data.event_id;
            console.log(Event_id);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    await getid();

    if (Event_id){
        fetch(`http://localhost:8000/api/${Event_id}/`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                
                eventStartTime = new Date(data.event_time);
                // Convert duration ("05:00:00") into seconds
                const [hours, minutes, seconds] = data.event_duration.split(':').map(Number);
                duration = hours * 3600 + minutes * 60 + seconds;

                console.log("Event Start Time:", eventStartTime);
                console.log("Event Duration (seconds):", duration);

                EtimePara.textContent += eventStartTime.toLocaleString();
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }
    

   
    async function getEventDetails(){
        try {
            const response = await fetch("http://localhost:8000/api/id/");
            const data = await response.json();
        } catch (error) {
            console.error("Error:", error);
        }
    }

    await getEventDetails();

    let count = 1;

    addSlotBtn.addEventListener("click", function(event) {
        event.preventDefault();
        count++;

        let pEl = document.createElement("p");
        let p1El = document.createElement("p");
        let p2El = document.createElement("p");

        let timeEl1 = document.createElement("input");
        timeEl1.type = "time";
        timeEl1.id = `s${count}-from`;
        timeEl1.required = true;

        let timeEl2 = document.createElement("input");
        timeEl2.type = "time";
        timeEl2.id = `s${count}-to`;
        timeEl2.required = true;

        // Enforce first slot time validation based on event start time
        if (count === 1) {
            timeEl1.min = eventStartTime.toISOString().substring(11, 16); // Ensure greater than or equal to event start time
        }
        const maxEventEndTime = new Date(eventStartTime.getTime() + duration * 1000);
        timeEl1.max = maxEventEndTime.toISOString().substring(11, 16);
        // Enforce minimum start time based on the last end time
        if (lastEndTime) {
            timeEl1.min = lastEndTime;
        }

        // Ensure the slot time is less than event_time + duration
        let endTime = new Date(eventStartTime.getTime() + duration * 1000);
        timeEl1.max = endTime.toISOString().substring(11, 16); // Extracts the "HH:mm" part from the ISO string

        pEl.textContent = `Slot ${count}:`;
        p1El.textContent = "From:";
        p2El.textContent = "To:";

        slotsDiv.appendChild(pEl);
        slotsDiv.appendChild(p1El);
        slotsDiv.appendChild(timeEl1);
        slotsDiv.appendChild(p2El);
        slotsDiv.appendChild(timeEl2);

        // Update lastEndTime whenever the "To" time changes
        timeEl2.addEventListener("change", function() {
            lastEndTime = timeEl2.value;
        });
    });

    // Validate slot times before submission
    function validateSlots() {
        let valid = true;
        let previousEndTime = null;
        const eventEndTime = new Date(eventStartTime.getTime() + duration * 1000);
        console.log("Eventy_end time:",eventEndTime)

        for (let i = 1; i <= count; i++) {
            let fromTime = document.getElementById(`s${i}-from`).value;
            let toTime = document.getElementById(`s${i}-to`).value;

            // Convert time strings to Date objects for comparison
            let fromDateTime = new Date(`${eventStartTime.toISOString().split('T')[0]}T${fromTime}:00`);
            let toDateTime = new Date(`${eventStartTime.toISOString().split('T')[0]}T${toTime}:00`);

            // Check if the first slot's start time is within the event time window
            if(fromTime ==""|| toTime==""){
                alert(`Fill the slots before submitting.`);
                valid = false;
                break;
            }
            if (i === 1 && (fromDateTime < eventStartTime || fromDateTime > eventEndTime)) {
                alert(`Slot 1: Start time must be within the event's scheduled time.`);
                valid = false;
                break;
            }

            // Check if the last slot's end time is within the event time window
            if (i === count && (toDateTime > eventEndTime || toDateTime < eventStartTime)) {
                alert(`Slot ${count}: End time must be within the event's scheduled time.`);
                valid = false;
                break;
            }

            // Check if the "from" time is later than the previous "to" time
            if (previousEndTime && fromDateTime < previousEndTime) {
                alert(`Slot ${i}: Start time cannot be earlier than the previous slot's end time.`);
                valid = false;
                break;
            }

            // Check if "from" time is less than "to" time for the same slot
            if (fromDateTime >= toDateTime) {
                alert(`Slot ${i}: Start time must be earlier than end time.`);
                valid = false;
                break;
            }

            previousEndTime = toDateTime; // Update for the next iteration
        }
        
        return valid;
    }

    // Handle form submission
    submitSlotsBtn.addEventListener("click", function(event) {
        event.preventDefault();

        if (!validateSlots()) {
            return; // Do not proceed if validation fails
        }

        let data = {
            'slots': {}
        };

        for (let i = 1; i <= count; i++) {
            let fromTime = document.getElementById(`s${i}-from`).value;
            let toTime = document.getElementById(`s${i}-to`).value;
            if (fromTime && toTime) {
                data.slots[`key${i}`] = `(${fromTime},${toTime})`;
            }
        }

        fetch(`http://localhost:8000/api/slots/${Event_id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(result => {
                console.log('Success:', result);
                window.location.href = 'http://localhost:8000/manageEvent/';
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
    // Event timer (if needed)
    const timerStartStr = document.getElementById('timer-start').dataset.value;
    const timerDuration = parseFloat(document.getElementById('timer-duration').dataset.value);
    const timerStart = new Date(timerStartStr);

    if (!isNaN(timerStart.getTime()) && !isNaN(timerDuration)) {
        const endTime = new Date(timerStart.getTime() + timerDuration * 1000);
        const now = new Date();
        let remainingTime = endTime - now;

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


    

