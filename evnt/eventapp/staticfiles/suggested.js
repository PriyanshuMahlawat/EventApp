document.addEventListener("DOMContentLoaded", async function () {
    let Event_id;
    const FinaliseBtn = document.getElementById("finalise-btn");
    
    let table = {};

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
    await getid();

    async function createmodifyTable() {
        try {
            const response = await fetch(`http://localhost:8000/api/tableslots/${Event_id}/`);
            const data = await response.json();
            table = data;

            const data1 = {
                'changes': null,
                'table': table,
            };

            await fetch(`http://localhost:8000/api/tablemodify/${Event_id}/`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(data1),
            });
        } catch (error) {
            console.error("Error:", error);
        }
    }
    await createmodifyTable();
    
    // Fetching slot data
    try {
        const response = await fetch(`http://localhost:8000/api/tablemodify/${Event_id}/`);
        const data = await response.json();
        console.log("Fetched Slot Data:", data);
        createTable(data.slot); // Pass data.slot to createTable function
    } catch (error) {
        console.error("Error fetching table slots:", error);
    }

    // Function to create the HTML table
    async function createTable(slotData) {
        const headerRow = document.getElementById('headerRow');
        const tableBody = document.getElementById('tableBody');
    
        // Clear existing rows
        tableBody.innerHTML = '';
        headerRow.innerHTML = ''; // Clear header row for fresh headers
    
        // Create headers dynamically based on room data
        const roomKeys = Object.keys(slotData);
        roomKeys.forEach(room => {
            const th = document.createElement('th');
            th.textContent = `Room ${room}`; // Dynamic room names
            headerRow.appendChild(th);
        });
    
        // Find the maximum number of slots in any room
        const maxSlots = Math.max(...roomKeys.map(room => slotData[room].length));
    
        // Create rows for each slot
        for (let i = 0; i < maxSlots; i++) {
            const row = document.createElement('tr');
    
            roomKeys.forEach(room => {
                const cell = document.createElement('td');
                cell.setAttribute('id', `room${room}${i}-dropzone`); // Set ID for the drop zone
    
                if (i < slotData[room].length) {
                    const slot = slotData[room][i];
                    const userNames = Object.keys(slot);
                    const times = slot[userNames[0]]; // Assuming times are the same for all users
    
                    // Extract only the hour and minutes (assuming time format is hh:mm:ss)
                    const startTime = times[0].slice(0, 5);
                    const endTime = times[1].slice(0, 5);
    
                    cell.innerHTML = `<strong>${startTime} - ${endTime}</strong><br/>`;
    
                    // Handle null or undefined users
                    if (userNames[0] !== "null") {
                        userNames.forEach(user => {
                            const userButton = document.createElement('button');
                            userButton.textContent = user;
                            userButton.id = `user-button-${user}`; // Assign a unique ID
                            userButton.draggable = true; // Make the button draggable
    
                            // Set up data to transfer on drag
                            userButton.addEventListener('dragstart', function (event) {
                                console.log("Dragging");
                                const prevRoom = room; // Current room of the user
                                const prevNames = userNames.join(", "); // Get all usernames in the current slot
                                event.dataTransfer.setData('text/plain', JSON.stringify({
                                    user: user,
                                    prevRoom: prevRoom,
                                    prevNames: prevNames,
                                    startTime: startTime,
                                    endTime: endTime
                                }));
                            });
    
                            cell.appendChild(userButton); // Append the button to the cell
                        });
                    } else {
                        cell.innerHTML += "Empty"; // Show "Empty" for null users
                    }
                } else {
                    cell.innerHTML = "Empty"; // Show "Empty"
                }
    
                // Append the cell to the row
                row.appendChild(cell);
    
                // Set up drop zone for this specific cell
                cell.addEventListener('dragover', function (event) {
                    event.preventDefault(); // Allow the drop
                    console.log("Drop zone active");
                });
    
                cell.addEventListener('drop', async function (event) {
                    console.log("Dropped into:", cell.id);
                    const data = event.dataTransfer.getData('text/plain');
                    const { user, prevRoom, prevNames, startTime, endTime } = JSON.parse(data);
                    const newRoom = room; // Current room for drop
    
                    console.log(`User: ${user}`);
                    console.log(`Previous Room: ${prevRoom}`);
                    console.log(`Previous Names: ${prevNames}`);
                    console.log(`New Room: ${newRoom}`);
                    console.log(`Start Time: ${startTime}`);
                    console.log(`End Time: ${endTime}`);
    
                    let Arr = [prevNames, user, prevRoom, newRoom, startTime, endTime];
    
                    await patchTable(Arr);
                    let table2 = await getmodifiedTable();
                    
                    createTable(table2.slot); // Rebuild table with new data
                });
            });
    
            // Append the row to the table body
            tableBody.appendChild(row);
        }
    }
    
    
    async function getmodifiedTable(){
        const response = await fetch(`http://localhost:8000/api/tablemodify/${Event_id}/`);
        const data3 = await response.json();
        const table2 = data3;
        return table2;
    }

    async function patchTable(Arr){
        let data4 = {
            'changes': Arr,
        };
        await fetch(`http://localhost:8000/api/tablemodify/${Event_id}/`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data4),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Success:", data);
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }

    FinaliseBtn.addEventListener("click", function (event) {
        const data = {};
        event.preventDefault();
        fetch(`http://localhost:8000/api/finaltable/${Event_id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            
            console.log("Success");
            document.getElementById("finalizationModal").style.display = "flex";
        })
        .catch(error => console.error("Error finalizing:", error));
    });
    document.getElementById('ok-btn').addEventListener('click', function () {
        document.getElementById("finalizationModal").style.display = "none";
    });

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
