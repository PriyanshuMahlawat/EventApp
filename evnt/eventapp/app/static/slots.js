document.addEventListener("DOMContentLoaded", async function() {
    let EtimePara = document.getElementById("E-time");
    let slotsDiv = document.getElementById("slot-div");
    let addSlotBtn = document.getElementById("add-slots");
    let submitSlotsBtn = document.getElementById("submit-slots");
    let name=  document.getElementById("name").textContent;
    let Event_id;

    

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
            console.log(Event_id)
        } catch (error) {
            console.error("Error:", error);
        }
    }
    await getid();
    if(Event_id){
        fetch(`http://localhost:8000/api/${Event_id}/`)
        .then(response => response.json())
        .then(data => {           
            EtimePara.textContent += new Date(data.event_time).toLocaleString();           
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }
    

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

        pEl.textContent = `Slot ${count}:`;
        p1El.textContent = "From:";
        p2El.textContent = "To:";

        slotsDiv.appendChild(pEl);
        slotsDiv.appendChild(p1El);
        slotsDiv.appendChild(timeEl1);
        slotsDiv.appendChild(p2El);            
        slotsDiv.appendChild(timeEl2);
    });

    submitSlotsBtn.addEventListener("click", function(event) {
        event.preventDefault();
        let data = {
            
            'slots': {}
        };
        for (let i = 1; i <= count; i++) {
            let fromTime = document.getElementById(`s${i}-from`).value;
            let toTime = document.getElementById(`s${i}-to`).value;
            if(fromTime != null && toTime != null){
                data.slots[`key${i}`] = `(${fromTime},${toTime})`;
            }
            
        }

        fetch(`http://localhost:8000/api/slots/${Event_id}/`,{
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
