document.addEventListener("DOMContentLoaded", function () {
    const notiList = document.getElementById("noti-list");
    
    // Function to get CSRF token from cookies
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

    // Fetch notifications
    fetch("http://localhost:8000/api/noti/")
        .then(response => response.json())
        .then(data => {
            console.log(data);
            addtoList(data);
        })
        .catch(error => {
            console.error("Error:", error);
        });

    // Function to add notifications to the list
    function addtoList(Arr) {
        Arr.sort((a, b) => a.create_time - b.create_time);
        for (let i = 0; i < Arr.length; i++) {
            
            let listEl = document.createElement("li");
            let paraEl = document.createElement("p");
            let paraEl2 = document.createElement("p");
            let linkdel = document.createElement("a");
            let linkdel2 = document.createElement("a");
            let acceptBtn = document.createElement("button");
            let rejectBtn = document.createElement("button");
            let acceptIcon = document.createElement("i");
            let rejectIcon = document.createElement("i");

            let id = Arr[i].id;
            acceptIcon.classList.add('fas', 'fa-check-circle');
            rejectIcon.classList.add('fas', 'fa-times');

            acceptBtn.appendChild(acceptIcon);
            rejectBtn.appendChild(rejectIcon);
            const createTime = new Date(Arr[i].create_time);
            timeago = Date.now()-createTime;
            const secondsAgo = Math.floor(timeago / 1000);
            const minutesAgo = Math.floor(timeago / (1000 * 60));
            const hoursAgo = Math.floor(timeago / (1000 * 60 * 60));
            const daysAgo = Math.floor(timeago / (1000 * 60 * 60 * 24));
            var realTimeago = `${secondsAgo} seconds ago`;
            if(minutesAgo && !hoursAgo && !daysAgo){
                realTimeago = `${minutesAgo} minutes ago`;
            }
            else if(hoursAgo && !daysAgo){
                realTimeago = `${hoursAgo} hours ago`;
            }
            else if(daysAgo){
                realTimeago = `${daysAgo} days ago`;
            }
            

            let notidellink = `http://localhost:8000/api/notidel/${id}/`;

            paraEl.textContent = `${Arr[i].name} has requested to join your Event.`;
            paraEl2.textContent = `${realTimeago}`;
            linkdel.href = notidellink;
            linkdel2.href = notidellink;

            let container = document.createElement("div");
            container.classList.add("request-container");
            linkdel.appendChild(acceptBtn);
            linkdel2.appendChild(rejectBtn);

            
            linkdel.addEventListener("click", function (event) {
                event.preventDefault();
                deleteNotification(notidellink, listEl);
                addmembers(Arr[i].Event_id, Arr[i].name);
            });

            linkdel2.addEventListener("click", function (event) {
                event.preventDefault();
                deleteNotification(notidellink, listEl);
            });

            container.appendChild(paraEl);
            container.appendChild(paraEl2);
            container.appendChild(linkdel);
            container.appendChild(linkdel2);

            listEl.appendChild(container);
            notiList.appendChild(listEl);
        }
    }

    // Function to delete a notification
    function deleteNotification(url, listItem) {
        fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': csrftoken,
            }
        })
        .then(response => {
            if (response.ok) {
                console.log("Notification deleted");
                listItem.remove(); 
            } else {
                console.error("Failed to delete notification");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }

    // Function to add members to an event
    function addmembers(eventid, name) {
        data = {
            members: name,
        }
        fetch(`http://localhost:8000/api/addmembers/${eventid}/`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,    
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Response not ok", response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log("Member added successfully.");
        })
        .catch(error => {
            console.error("Error", error);
        });
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
