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

    function update(data){
        fetch(`http://localhost:8000/api/${id}/`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Response not ok:", response.statusText)
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            showSuccessModal();
        })
        .catch(error => {
            console.error("Error:", error);
        })
    }

    function showSuccessModal() {
        const successModal = document.getElementById("modal-outer-success");
        successModal.style.display = "flex";
    }

    document.getElementById("change1").addEventListener("click", function() {
        var data = { 'Event_name': document.getElementById("name").value };
        update(data);
        modals[0].style.display = "none";
    });

    document.getElementById("change2").addEventListener("click", function() {
        var data = { 'Event_Thumbnail': document.getElementById("image").files[0] };
        update(data);
        modals[1].style.display = "none";
    });

    document.getElementById("change3").addEventListener("click", function() {
        var data = { 'create_time': document.getElementById("time").value };
        update(data);
        modals[2].style.display = "none";
    });

    document.getElementById("change4").addEventListener("click", function() {
        var data = { 'roomArr': document.getElementById("rooms").value };
        update(data);
        modals[3].style.display = "none";
    });

    document.getElementById("change5").addEventListener("click", function() {
        var data = { 'Detail': document.getElementById("detail").value };
        update(data);
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
});
