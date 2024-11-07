document.addEventListener("DOMContentLoaded", async function () {
    const tableEl = document.getElementById("table");
    const event_id = await getCookie('event_id');
    const username = document.getElementById("name").textContent;
    let roomArr = [];
    let DynamicDict = {};
    let timeSpentDict = {};
    let currentRoom = null;
    let roomEntryTime = null;
    let RealTable = {};

    getCurrentTable();

    // CSRF token function
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

    async function getCookie(name) {
        if (document.cookie) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }
        return 1;
    }

    async function getFinalTable() {
        console.log("Fetching final table");
        try {
            const response = await fetch(`http://localhost:8000/api/realTable/${username}/${event_id}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Final table data received:", data);
            RealTable = data.table;
            return RealTable;
        } catch (error) {
            console.error("Error fetching table:", error);
            throw error;
        }
    }

    function getCurrentTable() {
        fetch(`http://localhost:8000/api/currenttable/${event_id}`)
            .then(response => response.json())
            .then(data => {
                DynamicDict = data.table || {};
                console.log("Getting table", DynamicDict);
                fetchEventRooms();
            })
            .catch(error => console.error("Error fetching table:", error));
    }

    function updateCurrentTable() {
        return fetch(`http://localhost:8000/api/currenttable/${event_id}/`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ table: DynamicDict })
        })
            .then(response => response.json())
            .then(data => {
                console.log("Table data sent successfully:", data);
            })
            .catch(error => console.error("Error updating table:", error));
    }

    function checkAvailabilityEnter(name, dict) {
        let rooms = Object.keys(dict);
        for (let i = 0; i < rooms.length; i++) {
            let memArr = dict[rooms[i]];
            for (let j = 0; j < memArr.length; j++) {
                if (name === memArr[j]) {
                    return false;
                }
            }
        }
        return true;
    }

    function checkAvailabilityLeave(name, dict, room) {
        let n = dict[room].length;
        for (let i = 0; i < n; i++) {
            if (name == dict[room][i]) {
                return true;
            }
        }
        return false;
    }

    function recordRoomEntry(room) {
        if (currentRoom) {
            recordRoomExit();
        }
        currentRoom = room;
        roomEntryTime = new Date();
    }

    function recordRoomExit() {
        if (currentRoom && roomEntryTime) {
            let exitTime = new Date();
            let timeSpent = (exitTime - roomEntryTime) / 1000;

            if (!timeSpentDict[currentRoom]) {
                timeSpentDict[currentRoom] = 0;
            }
            timeSpentDict[currentRoom] += timeSpent;

            console.log("Working", timeSpentDict);
            currentRoom = null;
            roomEntryTime = null;
        }
    }

    setInterval(function () {
        getCurrentTable();
        createTable(DynamicDict, roomArr);
    }, 5000);

    function fetchEventRooms() {
        fetch(`http://localhost:8000/api/${event_id}/`)
            .then(response => response.json())
            .then(data => {
                roomArr = data.roomArr;
                createTable(DynamicDict, roomArr);
            })
            .catch(error => {
                console.error("Error:", error);
            });
    }

    function createTable(DynamicDict, arr) {
        for (let i = 0; i < arr.length; i++) {
            let room = arr[i];
            if (!DynamicDict[room]) {
                DynamicDict[room] = [];
            }
        }

        tableEl.innerHTML = '';

        for (let i = 0; i < arr.length; i++) {
            let room = arr[i];
            let row = document.createElement("tr");
            let tdRoom = document.createElement("td");
            let tdMember = document.createElement("td");
            let tdOptions = document.createElement("td");

            let enterBtn = document.createElement("button");
            let enterIcon = document.createElement("i");
            let leaveBtn = document.createElement("button");
            let leaveIcon = document.createElement("i");

            tdRoom.textContent = room;

            tdMember.textContent = DynamicDict[room] && DynamicDict[room].length > 0
                ? DynamicDict[room].join(', ')
                : "No one is present";

            enterIcon.classList.add('fa', 'fa-sign-in');
            leaveIcon.classList.add('fa', 'fa-sign-out');

            enterBtn.classList.add('enter-btn');
            leaveBtn.classList.add('leave-btn');

            enterBtn.appendChild(enterIcon);
            leaveBtn.appendChild(leaveIcon);

            enterBtn.addEventListener("click", function (event) {
                event.preventDefault();

                if (checkAvailabilityEnter(username, DynamicDict)) {
                    DynamicDict[room].push(username);
                    recordRoomEntry(room);
                    createTable(DynamicDict, arr);
                    updateCurrentTable();
                } else {
                    document.getElementById('modalOuterEnter').style.display = 'flex';
                }
            });

            leaveBtn.addEventListener("click", function (event) {
                event.preventDefault();
                if (checkAvailabilityLeave(username, DynamicDict, room)) {
                    let index = DynamicDict[room].indexOf(username);
                    if (index !== -1) {
                        DynamicDict[room].splice(index, 1);
                        recordRoomExit();
                        createTable(DynamicDict, arr);
                        updateCurrentTable();
                    }
                } else {
                    document.getElementById('modalOuterLeave').style.display = 'flex';
                }
            });

            tdOptions.appendChild(enterBtn);
            tdOptions.appendChild(leaveBtn);
            row.appendChild(tdRoom);
            row.appendChild(tdMember);
            row.appendChild(tdOptions);
            tableEl.appendChild(row);
        }
    }

    document.getElementById('ok-btnEnter').addEventListener('click', function () {
        document.getElementById('modalOuterEnter').style.display = 'none';
    });

    document.getElementById('ok-btnLeave').addEventListener('click', function () {
        document.getElementById('modalOuterLeave').style.display = 'none';
    });

    function prepareRealTableData() {
        recordRoomExit();
        let records = [];

        for (let room in timeSpentDict) {
            if (timeSpentDict.hasOwnProperty(room)) {
                records.push({
                    "room": room,
                    "time_spent": timeSpentDict[room]
                });
            }
        }

        return {
            [username]: {
                "records": records
            }
        };
    }

    async function prepareAndSendData() {
        try {
            // Ensure RealTable is populated
            await getFinalTable();
            
            console.log("Preparing to send data:", RealTable);
            
            if (!RealTable || Object.keys(RealTable).length === 0) {
                console.error("RealTable is empty or undefined");
                return;
            }

            const response = await fetch(`http://localhost:8000/api/excelSheets/${event_id}/`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(RealTable)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Excel generation result:", result);

            // Show completion modal
            document.getElementById('modalOuterEndEvent').style.display = 'block';
        } catch (error) {
            console.error("Error in prepareAndSendData:", error);
        }
    }

    const timerStartStr = document.getElementById('timer-start').dataset.value;
    const timerDuration = parseFloat(document.getElementById('timer-duration').dataset.value);

    console.log("Timer Start String:", timerStartStr);
    console.log("Timer Duration (seconds):", timerDuration);

    const timerStart = new Date(timerStartStr);
    if (!isNaN(timerStart.getTime()) && !isNaN(timerDuration)) {
        const endTime = new Date(timerStart.getTime() + timerDuration * 1000);
        const now = new Date();
        let remainingTime = endTime - now;

        async function redirectPage() {
            recordRoomExit();
            const RealTable_data = prepareRealTableData();
            try {
                const response = await fetch(`http://localhost:8000/api/realTable/${username}/${event_id}/`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    body: JSON.stringify(RealTable_data),
                });

                if (!response.ok) {
                    throw new Error("Response not ok: " + response.statusText);
                }

                const data = await response.json();
                console.log("RealTableView:", RealTable_data);

                // Clear the dynamic dictionary and update the current table
                DynamicDict = {};
                await updateCurrentTable();
                await prepareAndSendData();

            } catch (error) {
                console.error("Error in redirectPage:", error);
            }
        }

        if (remainingTime > 0) {
            setTimeout(redirectPage, remainingTime);
        } else {
            redirectPage();
        }

        document.getElementById('check-report-btn').addEventListener("click", function () {
            window.location.href = 'http://localhost:8000/completedEvents/';
        });
    }
});