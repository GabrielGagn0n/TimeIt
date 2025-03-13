browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    let url = new URL(tabs[0].url);
    let domain = url.hostname.replace(/^www\./, ""); // Remove 'www.'

    // Get saved sites from storage
    browser.storage.local.get("savedSites").then((data) => {
        let sites = data.savedSites || [];
        console.log(sites);
        let saveButton = document.getElementById("saveSite");
        let removeButton = document.getElementById("removeSite");
        let included = sites.includes(domain);

        // Show/hide buttons based on whether the domain is saved
        if (included) {
            removeButton.style.display = "block"; 
            saveButton.style.display = "none"; 
        } else {
            saveButton.style.display = "block"; 
            removeButton.style.display = "none";
        }

        // Add event listeners for the buttons
        removeButton.addEventListener("click", function () {
            clickRemove(domain, tabs[0].id, removeButton, saveButton);
        });
        saveButton.addEventListener("click", function () {
            clickAdd(domain, tabs[0].id, saveButton, removeButton);
        });
    });
});

// Function to remove a site
function clickRemove(domain, tabId, removeButton, saveButton) {
    browser.storage.local.get("savedSites").then((data) => {
        let sites = data.savedSites || [];
        sites = sites.filter(site => site !== domain);
        browser.storage.local.set({ savedSites: sites }).then(() => {
            browser.tabs.sendMessage(tabId, { action: "removeSquare" });
            removeButton.style.display = "none";
            saveButton.style.display = "block";
        });
    });
}

// Function to add a site
function clickAdd(domain, tabId, saveButton, removeButton) {
    browser.storage.local.get("savedSites").then((data) => {
        let sites = data.savedSites || [];
        if (!sites.includes(domain)) {
            sites.push(domain);
            browser.storage.local.set({ savedSites: sites }).then(() => {
                browser.tabs.sendMessage(tabId, { action: "addSquare" });
                saveButton.style.display = "none";
                removeButton.style.display = "block"; 
            });
        }
    });
}
