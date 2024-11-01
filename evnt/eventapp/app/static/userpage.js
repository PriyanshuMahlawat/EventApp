document.addEventListener("DOMContentLoaded", function () {

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
    const EventList = document.getElementById("event-list");
    var user_name = document.getElementById("user_name").textContent;
 
    var email = document.getElementById("email").textContent;
    var logged_in = document.getElementById("logged_in").textContent;
    let valid = true;
    console.log(email)
    fetch("http://localhost:8000/api/eventlist/")
        .then(response => response.json())
        .then(data => {
            if (data.members === null) {
                console.log("No members available.");
                data.members = "";
            }
            data.sort((a, b) => b.id - a.id);
            console.log(data);
            addtolist(data);
        })
        .catch(error => console.error("Errors", error));

    function addtolist(Arr){
        let n = Arr.length;

        for (let i = 0; i < n; i++) {
            let eventid = Arr[i].id
            let date = ` On ${Arr[i].event_time.slice(0, 10)}  at ${Arr[i].event_time.slice(11, 16)}`
            let membersArr = Arr[i].members ? Arr[i].members.split(',') : [];

            let partlist = document.createElement("li");
            let evnm = document.createElement("p");
            let img = document.createElement("img");
            let hostnm = document.createElement("p");
            let evtime = document.createElement("p");
            let linkdetail = document.createElement("a");
            let detailbtn = document.createElement("button");

            let joinbtn = document.createElement("button");
            evnm.textContent = Arr[i].Event_name;
            img.src = Arr[i].Event_Thumbnail;
            img.style.width = '160px';
            img.style.height = '100px';
            hostnm.textContent = `By ${Arr[i].host_name}`;

            evtime.textContent = date;
            var detailurl = `http://localhost:8000/api/${Arr[i].id}/`;
            console.log(detailurl)
            linkdetail.href = detailurl;
            detailbtn.textContent = "Detail";

            joinbtn.textContent = "Join";
            const modal1 = document.getElementById("modal-outer1");
            const okBtn1 = document.getElementById("ok-btn1");
            const modal2 = document.getElementById("modal-outer2");
            const okBtn2 = document.getElementById("ok-btn2");
            const modal3 = document.getElementById("modal-outer3");
            const okBtn3 = document.getElementById("ok-btn3");
            const modal4 = document.getElementById("modal-outer4");
            const okBtn4 = document.getElementById("ok-btn4");
            joinbtn.addEventListener("click", function (event) {
                event.preventDefault();
                
                console.log(email)
                console.log(user_name,membersArr)
                if(user_name == "None"){
                    valid =false;
                    modal4.style.display = "flex";
                }
                if(membersArr.includes(user_name)){
                    valid =false;
                    modal2.style.display = "flex";
                }
                else if(user_name == Arr[i].host_name){
                    valid =false;
                    modal3.style.display = "flex";
                }
                
                console.log(valid)


                if (valid) {



                    var data = {
                        name: user_name,

                        Event_id: eventid,
                    }
                    if (user_name != Arr[i].host_name) {
                        fetch("http://localhost:8000/api/noti/", {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': csrftoken
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
                                console.log('success', data);
                            })
                            .catch(error => {
                                console.error("Error:", error);
                            })

                        modal1.style.display = "flex";
                    }


                }
                


            })
            okBtn1.addEventListener("click", function (event) {
                event.preventDefault();
                modal1.style.display = "none";

            })
            okBtn2.addEventListener("click", function (event) {
                event.preventDefault();
                modal2.style.display = "none";

            })
            okBtn3.addEventListener("click", function (event) {
                event.preventDefault();
                modal3.style.display = "none";

            })
            okBtn4.addEventListener("click", function (event) {
                event.preventDefault();
                modal4.style.display = "none";

            })
            detailbtn.addEventListener("click", function (event) {
                event.preventDefault();
                if(logged_in == ""){
                    modal4.style.display = 'flex';
                }
                else{
                    data = {
                        'event_id': `${eventid}`,
                    }
                    console.log(data)
                    fetch("http://localhost:8000/api/id/", {
                        method: "POST",
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
                            console.log('success', data);
                            window.location.href = "http://localhost:8000/detail/";
                        })
                        .catch(error => {
                            console.error("Error:", error);
                        })
                }
                
            })

            partlist.appendChild(evnm);
            partlist.appendChild(img);
            partlist.appendChild(hostnm);
            partlist.appendChild(evtime);
            partlist.appendChild(linkdetail);

            linkdetail.appendChild(detailbtn);
            partlist.appendChild(joinbtn);

            EventList.appendChild(partlist);


            evnm.classList.add("evnm");
            img.classList.add("imgcls");
            hostnm.classList.add("hostnm");
            evtime.classList.add("evtime");
            detailbtn.classList.add("detailbtn");
            joinbtn.classList.add("joinbtn");

        }
    }

})