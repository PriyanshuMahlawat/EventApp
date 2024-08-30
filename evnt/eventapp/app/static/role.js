document.addEventListener("DOMContentLoaded", function() {
    var dropdown = document.getElementById("roles");
    var searchinput = document.getElementById("search-input");
    var searchBtn = document.getElementById("s-btn");
    var pmember = document.getElementById("membername");
    var assignBtn = document.getElementById("assign-btn");
    var b1 = document.getElementById("b1");
    var b2 = document.getElementById("b2");
    var b3 = document.getElementById("b3");
    var b4 = document.getElementById("b4");
    var Roles = [];
    var members1 = [];
    let id;





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






    fetch("http://localhost:8000/api/id/")
    .then(response=>response.json())
    .then(data=>{
        id = data.id;
    })
    .catch(error=>{console.error("Error",error)})



    fetch(`http://localhost:8000/api/memberlist/${id}`)
    .then(response=>response.json())
    .then(data=>{
        addtomembers(data);
    })
    .catch(error=>{console.error("Error:",error)});


    searchBtn.addEventListener("click",function(){
        var name = searchinput.value.toLowerCase();
        var lowermembers = members1.map(function(item){
            
            return item.toLowerCase();
        })
        if(name in lowermembers){
            pmember.textContent = name;
        }
        else{
            pmember.textContent = "No member with that name"
        }
    })

    assignBtn.addEventListener("click",function(){
        var rolesString = "";
        for(let i=0;i<Roles.length;i++){
            rolesString += Roles[i];
        }
        postData = {
            "permission" : `${pmember.textContent}-${rolesString}`
        }

        fetch(`http://localhost:8000/api/memberlistupdate/${id}`,{
            method:'PATCH',
            headers:{
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken, 
            },
            body:JSON.stringify(postData),
        })
        .then(response=>{
            if(!response.ok){
                throw new Error("Response not ok:",response.statusText)
            }
            return response.json();
        })
        .then(data =>{
            console.log('success',data);
            assignBtn.textContent = "Assign New";
            let aTag = document.createElement("a");
            let link = "{% url 'roles' %}"
            aTag.href = link;
            aTag.appendChild(assignBtn);
            document.body.appendChild(aTag);
        })
        .catch(error=>{
            console.error("Error:",error);
        })

    })


    function addtomembers(arr){
        
            let members0 = arr.members.split(',')
            for(let j=0;j<members0.length;j++){
                members1.push(members0[j]);
            }
       
    }


    function handleButtonClick(roleValue, button) {
        return function(event) {
            event.preventDefault();
            button.style.display = "none";
            let index = Roles.indexOf(roleValue);
            if (index !== -1) {
                Roles.splice(index, 1); 
                console.log(Roles); 
            }
        };
    }
    
    dropdown.addEventListener("change", function(event) {
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

        if (Roles.indexOf(roleValue) === -1) {
            Roles.push(roleValue);
            console.log(Roles); 
        }
        
        button.style.display = "block";

        
        
        
        
        button.addEventListener("click", handleButtonClick(roleValue, button));
    });
});
