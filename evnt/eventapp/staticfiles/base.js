document.addEventListener("DOMContentLoaded", function() {
    const modalBtn = document.getElementById("modal-settings");
    const modal = document.getElementById("modal-outer");
    const modalInside = document.getElementById("modal-inside");

    
    modalBtn.addEventListener("click", function() {
        console.log("Modal button clicked");
        modal.style.display = modal.style.display === "block" ? "none" : "block";
    });

    
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            console.log("Clicked outside modal");
            modal.style.display = "none";
        }
    });
});
