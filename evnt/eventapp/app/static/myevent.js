document.addEventListener("DOMContentLoaded", function() {
    const hostedlistEl = document.getElementById("hosted-list");
    const joinedlistEl = document.getElementById("joined-list");


    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Check if this cookie is the one we're looking for
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    const csrftoken = getCookie('csrftoken');


    
    
    fetch("http://localhost:8000/api/host/")
    .then(response => response.json())
    .then(data => {
        addToHost(data);
    })
    .catch(error => {
        console.error("Error:", error);
    });

    function addToHost(data) {
        for (let i = 0; i < data.length; i++) {
            var arr = data[i].eve_names;
            let listEl = document.createElement("li");
            let paraEl = document.createElement("p");
            let dellink = document.createElement("a");
            let managelink = document.createElement("a");
            let delEventBtn = document.createElement("button");
            let manageBtn = document.createElement("button");

            paraEl.textContent = arr[i].Event_name;
            deletehost = `http://localhost:8000/api/hostdel/${arr[i].id}/`; 
            managelink.href = "http://localhost:8000/manageEvent/";
            manageBtn.textContent = "Manage";




            manageBtn.addEventListener("click",function(event){
                event.preventDefault();
                data = {
                    'event_id':`${arr[i].id}`,
                }
                console.log(data)
                fetch("http://localhost:8000/api/id/",{
                    method:"POST",
                    headers:{
                        'Content-Type':'application/json',
                        'X-CSRFToken':csrftoken,
                    },
                    body:JSON.stringify(data),
                })
                .then(response=>{
                    if(!response.ok){
                        throw new Error("Response not ok:",response.statusText)
                    }
                    return response.json();
                })
                .then(data =>{
                    console.log("before");
                    const expirationDate = new Date();
                    expirationDate.setTime(expirationDate.getTime() + (24*60 * 60 * 1000)); 
                    document.cookie = `event_id=${arr[i].id}; expires=${expirationDate.toUTCString()}; path=/;`;

                    
                    console.log('success',data);
                    console.log(document.cookie);
                    console.log('success',data);
                    window.location.href = "http://localhost:8000/manageEvent/";
                })
                .catch(error=>{
                    console.error("Error:",error);
                })
            })
            



            delEventBtn.addEventListener("click", function(event) {
                event.preventDefault();
                fetch(deletehost, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                })
                .then(response => {
                    if (response.ok) {
                        listEl.remove();  
                    } else {
                        console.error("Failed to delete event:", response.status);
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                });
            });

            dellink.href = "#"; 
            delEventBtn.textContent = "Delete Event";
            

            listEl.appendChild(paraEl);
            dellink.appendChild(delEventBtn);
            managelink.appendChild(manageBtn);
            listEl.appendChild(dellink);
            listEl.appendChild(managelink);
            hostedlistEl.appendChild(listEl);
        }
    }

    
    fetch("http://localhost:8000/api/joined/")
    .then(response => response.json())
    .then(data => {
        addToJoined(data);
    })
    .catch(error => {
        console.error("Error:", error);
    });

    function addToJoined(data) {
        for (let i = 0; i < data.length; i++) {
            var arr = data[i].joined_Events;
            let listEl = document.createElement("li");
            let paraEl = document.createElement("p");
            let leavelink = document.createElement("a");
            let managelink1 = document.createElement("a");
            let manageBtn1 = document.createElement("button");
            let leaveEventBtn = document.createElement("button");

            paraEl.textContent = arr[i].Event_name;
            deleteevent = `http://localhost:8000/api/leaveevent/${arr[i].id}/`; 
            
            leaveEventBtn.addEventListener("click", function(event) {
                event.preventDefault();
                fetch(deleteevent, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                })
                .then(response => {
                    if (response.ok) {
                        listEl.remove();  
                    } else {
                        console.error("Failed to leave event:", response.status);
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                });
            });

            manageBtn1.textContent = "Manage";
            manageBtn1.addEventListener("click",function(event){
                event.preventDefault();
                data = {
                    'event_id':`${arr[i].id}`,
                }
                console.log(data)
                fetch("http://localhost:8000/api/id/",{
                    method:"POST",
                    headers:{
                        'Content-Type':'application/json',
                        'X-CSRFToken':csrftoken,
                    },
                    body:JSON.stringify(data),
                })
                .then(response=>{
                    if(!response.ok){
                        throw new Error("Response not ok:",response.statusText)
                    }
                    return response.json();
                })
                .then(data =>{
                    console.log("before");
                    const expirationDate = new Date();
                    expirationDate.setTime(expirationDate.getTime() + (60 * 60 * 1000)); 
                    document.cookie = `event_id=${arr[i].id}; expires=${expirationDate.toUTCString()}; path=/;`;

                    
                    console.log('success',data);
                    console.log(document.cookie);
                    window.location.href = "http://localhost:8000/manageEvent/";
                })
                .catch(error=>{
                    console.error("Error:",error);
                })
            })

            leavelink.href = "#"; 
            leaveEventBtn.textContent = "Leave Event";

            listEl.appendChild(paraEl);
            leavelink.appendChild(leaveEventBtn);
            listEl.appendChild(leavelink);
            managelink1.appendChild(manageBtn1);
            listEl.appendChild(managelink1);
            joinedlistEl.appendChild(listEl);
        }
    }
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
});
