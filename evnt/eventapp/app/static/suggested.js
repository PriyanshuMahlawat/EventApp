document.addEventListener("DOMContentLoaded", async function () {
    let Event_id; // Declare Event_id using let
    const FinaliseBtn = document.getElementById("finalise-btn");
    const shareTable = document.getElementById("share-table");



    function getcsrfCookie(name) {
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

    const csrftoken = getcsrfCookie('csrftoken');





    // Function to get the event ID
    async function getid() {
        try {
            const response = await fetch("http://localhost:8000/api/id/");
            const data = await response.json();
            Event_id = data.event_id; // Store the fetched event ID
            console.log("Event ID:", Event_id);
        } catch (error) {
            console.error("Error fetching Event ID:", error);
        }
    }

    // Call the getid function and fetch table data afterward
    await getid(); // Wait for the event ID to be fetched

    try {
        const response = await fetch(`http://localhost:8000/api/tableslots/${Event_id}/`);
        const data = await response.json();
        console.log("Fetched Slot Data:", data); // Log the slot data structure
        createTable(data.slot); // Pass data.slot to createTable function
    } catch (error) {
        console.error("Error fetching table slots:", error);
    }

   // Function to create the HTML table
function createTable(slotData) {
    const headerRow = document.getElementById('headerRow');
    const tableBody = document.getElementById('tableBody');

    // Clear existing rows
    tableBody.innerHTML = '';
    headerRow.innerHTML = ''; // Clear header row for fresh headers

    // Create headers
    const headers = ['Room 1', 'Room 2']; // Adjust headers as needed
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    // Create rows for each room
    const maxSlots = Math.max(slotData["1"].length, slotData["2"].length);

    for (let i = 0; i < maxSlots; i++) {
        const row = document.createElement('tr');

        // Create cell for Room 1
        const room1Cell = document.createElement('td');
        if (i < slotData["1"].length) {
            const slot = slotData["1"][i];
            const user = Object.keys(slot)[0]; // Get the user
            const times = slot[user];
            room1Cell.innerHTML = `<strong>${times[0]} - ${times[1]}</strong><br/>`;

            if (user !== "null") {
                // Create a button for the user
                const userButton = document.createElement('button');
                userButton.textContent = user;
                userButton.id = `user-button-${user}`; // Assign a unique ID
                userButton.addEventListener("click", function () {
                    // You can add functionality here when the button is clicked
                    console.log(`User button clicked: ${user}`);
                });
                room1Cell.appendChild(userButton); // Append the button to the cell
            } else {
                room1Cell.innerHTML += "Empty"; // Show "Empty"
            }
        } else {
            room1Cell.innerHTML = "No slot<br/>"; // If no slot is available
        }

        // Create cell for Room 2
        const room2Cell = document.createElement('td');
        if (i < slotData["2"].length) {
            const slot = slotData["2"][i];
            const user = Object.keys(slot)[0]; // Get the user
            const times = slot[user];
            room2Cell.innerHTML = `<strong>${times[0]} - ${times[1]}</strong><br/>`;

            if (user !== "null") {
                // Create a button for the user
                const userButton = document.createElement('button');
                userButton.textContent = user;
                userButton.id = `user-button-${user}`; // Assign a unique ID
                userButton.addEventListener("click", function () {
                    // You can add functionality here when the button is clicked
                    console.log(`User button clicked: ${user}`);
                });
                room2Cell.appendChild(userButton); // Append the button to the cell
            } else {
                room2Cell.innerHTML += "Empty"; // Show "Empty"
            }
        } else {
            room2Cell.innerHTML = "No slot<br/>"; // If no slot is available
        }

        // Append the room cells to the row
        row.appendChild(room1Cell);
        row.appendChild(room2Cell);

        // Append the row to the table body
        tableBody.appendChild(row);
    }
}

    FinaliseBtn.addEventListener("click",function(event){
        data = {

        }
        event.preventDefault();
        fetch(`http://localhost:8000/api/finaltable/${Event_id}/`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data),
        })
        .then(response=>response.json())
        .then(data=>
        {
            shareTable.style.display = "block";
            FinaliseBtn.style.display = "none";
        }
        )
        .catch(error=>{
            console.error("Error:",error);
        })

    })

    // Part 2: Timer Handling Logic
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
