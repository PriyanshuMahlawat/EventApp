document.addEventListener("DOMContentLoaded", async function () {
    var dropdown = document.getElementById("roles");
    var searchinput = document.getElementById("search-input");
    
    var memdiv = document.getElementById("membername");
    var assignBtn = document.getElementById("assign-btn");
    var pmember = document.getElementById("pmember");
    var b1 = document.getElementById("b1");
    var b2 = document.getElementById("b2");
    var b3 = document.getElementById("b3");
    var b4 = document.getElementById("b4");
    var Roles = [];
    var members1 = [];
    let EId;

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
            const response = await fetch("http://localhost:8000/api/id/")
            const data = await response.json()
            
            EId = data.event_id;
        } catch (error) { console.error("Error", error) };

    }
    await getid();

    if (EId) {
        fetch(`http://localhost:8000/api/memberlist/${EId}`)
            .then(response => response.json())
            .then(data => {
                addtomembers(data);
            })
            .catch(error => { console.error("Error:", error) });
    }
    var name;
    searchinput.addEventListener("keyup", function (event) {
        event.preventDefault();
        name = searchinput.value.toLowerCase();
        let n = name.length;
        var lowermembers = members1.map(function (item) {
            return item.toLowerCase().substring(0, n);
        });
    
        memdiv.innerHTML = "";  
    
        if (lowermembers.includes(name)) {
            for (let i = 0; i < lowermembers.length; i++) {
                if (lowermembers[i] === name) {
                    let memberBtn = document.createElement("button");
                    memberBtn.textContent = members1[i];
                    memdiv.appendChild(memberBtn);
    
                    
                    memberBtn.addEventListener("click", function () {
                        name = members1[i];  
                        searchinput.value = name; 
                        pmember.textContent = `Assigning Roles to ${name.toUpperCase()}` ;
                        memdiv.innerHTML = "";  
                    });
                }
            }
        } else {
            memdiv.textContent = "No member with that name";
        }
    });
    

    assignBtn.addEventListener("click", function () {
        var rolesString = Roles.join("");
        postData = {
            "permission": `${name}-${rolesString}:${EId}`
        };
        
        fetch(`http://localhost:8000/api/memberlistupdate/${EId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(postData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Response not ok:", response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('success', data);
                assignBtn.textContent = "Assign New";
                let aTag = document.createElement("a");
                let doneBtn = document.createElement("button");
                doneBtn.textContent = "Done";
                let link = "http://localhost:8000/manageEvent/";
                aTag.href = link;
                aTag.appendChild(doneBtn);
                document.getElementById("for-button").appendChild(aTag);
            })
            .catch(error => {
                console.error("Error:", error);
            });
    });

    function addtomembers(arr) {
        let members0 = arr.members.split(',');
        for (let j = 0; j < members0.length; j++) {
            members1.push(members0[j]);
        }
    }

    function handleButtonClick(roleValue, button) {
        return function (event) {
            event.preventDefault();
            button.style.display = "none";
            let index = Roles.indexOf(roleValue);
            if (index !== -1) {
                Roles.splice(index, 1);
                console.log(Roles);
            }
        };
    }

    dropdown.addEventListener("change", function (event) {
        event.preventDefault();
        var selectedValue = dropdown.value;
        let button, roleValue;

        switch (selectedValue) {
            case "1":
                button = b1;
                roleValue = "1";
                break;
            case "2":
                button = b2;
                roleValue = "2";
                break;
            case "3":
                button = b3;
                roleValue = "3";
                break;
            case "4":
                button = b4;
                roleValue = "4";
                break;
            default:
                return;
        }

        if (button && Roles.indexOf(roleValue) === -1) {
            Roles.push(roleValue);
            console.log(Roles);
            button.style.display = "block";
            button.addEventListener("click", handleButtonClick(roleValue, button));
        }
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
