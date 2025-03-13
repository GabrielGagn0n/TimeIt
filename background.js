browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "saveWebsite") {
        browser.storage.local.get("savedSites").then((data) => {
            let sites = data.savedSites || [];
            if (!sites.includes(message.url)) {
                sites.push(message.url);
                browser.storage.local.set({ savedSites: sites });
            }
        });
    } else if (message.action === "removeWebsite") {
        browser.storage.local.get("savedSites").then((data) => {
            let sites = data.savedSites || [];
            sites = sites.filter(site => site !== message.url);
            browser.storage.local.set({ savedSites: sites });
        });
    } else if (message.action === "saveSquarePosition") {
        browser.storage.local.set({ squarePosition: message.position });
    } 
    else if (message.action === "getSquarePosition") {
        browser.storage.local.get("squarePosition").then((result) => {
            sendResponse({ position: result.squarePosition || { left: '10px', top: '10px' } });
        });
        return true;
    }
});
