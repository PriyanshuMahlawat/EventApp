document.addEventListener("DOMContentLoaded", function() {
    const username = document.getElementById("username").textContent.trim();
    
    // API URL
    const apiUrl = "http://localhost:8000/api/completed/get/";

    // Fetch data from the API
    fetch(apiUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        renderEventList(data.hosted, 'hosted-list', "Hosted");
        renderEventList(data.joined, 'joined-list', "Joined");
    })
    .catch(error => {
        console.error("Error fetching the event data:", error);
    });

    // Function to render event lists
    function renderEventList(events, elementId, title) {
        const listElement = document.getElementById(elementId);

        if (events.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = `No ${title} events found.`;
            listElement.appendChild(emptyMessage);
            return;
        }

        events.forEach(event => {
            const listItem = document.createElement('li');
            const eventLink = document.createElement('a');
            eventLink.href = event.excel_link;
            eventLink.textContent = `${event.Event_name} - Event Report`;
            listItem.appendChild(eventLink);
            listElement.appendChild(listItem);
        });
    }
});
