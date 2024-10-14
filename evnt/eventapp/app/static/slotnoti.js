document.addEventListener("DOMContentLoaded", function () {
    


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
