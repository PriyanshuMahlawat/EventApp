document.addEventListener("DOMContentLoaded",function(){
    const modalBtn = document.getElementById("modal-settings");
    const modal = document.getElementById("modal-outer");
    modalBtn.addEventListener("click",function(){
        console.log("click")
       modal.style.display = modal.style.display == "block" ? "none" : "block";

    })

})