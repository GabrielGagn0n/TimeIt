// Listener for messages from content scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "saveWebsite":
            saveWebsite(message.url);
            break;
        case "removeWebsite":
            removeWebsite(message.url);
            break;
        case "saveSquarePosition":
            saveSquarePosition(message.position);
            break;
        case "getSquarePosition":
            getSquarePosition(sendResponse);
            return true; // Keep the message channel open for async response
        default:
            console.warn(`Unknown action: ${message.action}`);
    }
});

// Function to save a website URL
function saveWebsite(url) {
    browser.storage.local.get("savedSites").then((data) => {
        let sites = data.savedSites || [];
        if (!sites.includes(url)) {
            sites.push(url);
            browser.storage.local.set({ savedSites: sites });
        }
    }).catch(error => console.error("Error saving website:", error));
}

// Function to remove a website URL
function removeWebsite(url) {
    browser.storage.local.get("savedSites").then((data) => {
        let sites = data.savedSites || [];
        sites = sites.filter(site => site !== url);
        browser.storage.local.set({ savedSites: sites });
    }).catch(error => console.error("Error removing website:", error));
}

// Function to save the square's position
function saveSquarePosition(position) {
    browser.storage.local.set({ squarePosition: position }).catch(error => console.error("Error saving square position:", error));
}

// Function to get the square's position
function getSquarePosition(sendResponse) {
    browser.storage.local.get("squarePosition").then((result) => {
        sendResponse({ position: result.squarePosition || { left: '10px', top: '10px' } });
    }).catch(error => console.error("Error getting square position:", error));
}
