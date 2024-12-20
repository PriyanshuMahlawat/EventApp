document.addEventListener("DOMContentLoaded", function() {

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
    var buttons = document.querySelectorAll("ul li button");
    var id;

    fetch("http://localhost:8000/api/id/")
    .then(response => response.json())
    .then(data => {
        id = data.event_id;
    })
    .catch(error => { console.error("Error", error) })

    var modals = {
        0: document.getElementById("modal-outer1"),
        1: document.getElementById("modal-outer2"),
        2: document.getElementById("modal-outer3"),
        3: document.getElementById("modal-outer4"),
        4: document.getElementById("modal-outer5"),
    };

    buttons.forEach((button, index) => {
        button.addEventListener("click", function() {
            modals[index].style.display = "flex";
        });
    });

    function update(data) {
        let isFormData = data instanceof FormData;
        
        fetch(`http://localhost:8000/api/${id}/`, {
            method: "PATCH",
            headers: {
                'X-CSRFToken': csrftoken,
                ...(isFormData ? {} : {'Content-Type': 'application/json'}) // Set content type only if not FormData
            },
            body: data, // Send data directly
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Response not ok: " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            showSuccessModal();
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }
    function showSuccessModal() {
        const successModal = document.getElementById("modal-outer-success");
        successModal.style.display = "flex";
    }

    document.getElementById("change1").addEventListener("click", function() {
        var data = { 'Event_name': document.getElementById("name").value };
        update(JSON.stringify(data));
        modals[0].style.display = "none";
    });

    document.getElementById("change2").addEventListener("click", function() {
        var formData = new FormData();
        var fileInput = document.getElementById("image").files[0];
    
        if (fileInput) {
            formData.append('Event_Thumbnail', fileInput);
            update(formData); 
            modals[1].style.display = "none";
        } else {
            console.error("No file selected.");
        }
    });

    document.getElementById("change3").addEventListener("click", function() {
        var data = {'event_time': document.getElementById("time").value };
        update(JSON.stringify(data));
        modals[2].style.display = "none";
    });

    document.getElementById("change4").addEventListener("click", function() {
        var data = { 'roomArr': document.getElementById("rooms").value };
        update(JSON.stringify(data));
        modals[3].style.display = "none";
    });

    document.getElementById("change5").addEventListener("click", function() {
        var data = { 'Detail': document.getElementById("detail").value };
        update(JSON.stringify(data));
        modals[4].style.display = "none";
    });

    window.addEventListener("click", function(event) {
        Object.values(modals).forEach(modal => {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    });

    document.getElementById("ok-button").addEventListener("click", function() {
        document.getElementById("modal-outer-success").style.display = "none";
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
