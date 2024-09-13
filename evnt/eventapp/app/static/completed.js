document.addEventListener("DOMContentLoaded", function() {
    const hostedlistEl = document.getElementById("hosted-list");
    const joinedlistEl = document.getElementById("joined-list");
    const username= document.getElementById("username").textContent;
    const check = document.getElementById("check").textContent;
    
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

    if(check == 1){
        fetch(`http://localhost:8000/api/completed/1/${username}/`) 
        .then(response => response.json())
        .then(data => {
            addToHost(data);
            console.log("hosted report")
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }

    function addToHost(data) {
        if (data.length === 1 && data[0].excel === null) {
            hostedlistEl.innerHTML = `<li>No Events Completed.</li>`;
        } else {
            for (let i = 0; i < data.length; i++) {
                let listEl = document.createElement("li");
                let paraEl = document.createElement("p");
                let downloadLink = document.createElement("a");
                
                paraEl.textContent = data[i].Event_name;
                
                downloadLink.href = `http://localhost:8000/media/excelSheets/${data[i].excel}`;
                downloadLink.download = data[i].excel;
                downloadLink.textContent = "Download Report";

                listEl.appendChild(paraEl);
                listEl.appendChild(downloadLink);
                hostedlistEl.appendChild(listEl);
            }
        }
    }

    if(check ==0){
        fetch(`http://localhost:8000/api/completed/0/${username}/`)
        .then(response => response.json())
        .then(data => {
            console.log("joined report")
            addToJoined(data);
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }

    function addToJoined(data) {
        if (data.length === 1 && data[0].excel === null) {
            joinedlistEl.innerHTML = `<li>No Events Participated.</li>`;
        } else {
            for (let i = 0; i < data.length; i++) {
                let listEl = document.createElement("li");
                let paraEl = document.createElement("p");
                let downloadLink = document.createElement("a");

                paraEl.textContent = data[i].Event_name;

                downloadLink.href = `http://localhost:8000/media/excelSheets/${data[i].excel}`;
                downloadLink.download = data[i].excel;
                downloadLink.textContent = "Download Report";

                listEl.appendChild(paraEl);
                listEl.appendChild(downloadLink);
                joinedlistEl.appendChild(listEl);
            }
        }
    }
});
