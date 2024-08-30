document.addEventListener("DOMContentLoaded",function(){
    const EventList = document.getElementById("event-list");
    
    fetch("http://localhost:8000/api/eventlist/")
    .then(response => response.json())
    .then(data=>{

        console.log(data);
        
        addtolist(data);
    })
    .catch(error => console.error("Errors",error));

    function addtolist(Arr){
        let n = Arr.length;
        
        for(let i=0;i<n;i++){
            
            let date = ` On ${Arr[i].event_time.slice(0,10)}  at about ${Arr[i].event_time.slice(11,16)}`


            let partlist  =document.createElement("li");
            let evnm = document.createElement("p");
            let img = document.createElement("img");
            let hostnm = document.createElement("p");
            let evtime = document.createElement("p");
            let linkdetail = document.createElement("a");
            let detailbtn = document.createElement("button");
            
            let joinbtn = document.createElement("button");            
            evnm.textContent = Arr[i].Event_name;
            img.src = Arr[i].Event_Thumbnail;
            img.style.maxWidth = "100%"; 
            hostnm.textContent = `By ${Arr[i].host_name}`;

            evtime.textContent = date;
            var detailurl = `http://localhost:8000/api/${Arr[i].id}`;
            console.log(detailurl)
            linkdetail.href = detailurl;
            detailbtn.textContent = "Detail";
            
            joinbtn.textContent = "Join";
            const modal =  document.getElementById("modal-outer1");
            const okBtn = document.getElementById("ok-btn1");
            joinbtn.addEventListener("click",function(event){
                event.preventDefault();
                modal.style.display = "block";
            })
            okBtn.addEventListener("click",function(event){
                event.preventDefault();
                modal.style.display="none";
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