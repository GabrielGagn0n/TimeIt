browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "saveSquarePosition") {
        browser.storage.local.set({ squarePosition: message.position });
    } 
    else if (message.action === "getSquarePosition") {
        browser.storage.local.get("squarePosition").then((result) => {
            sendResponse({ position: result.squarePosition || { left: '10px', top: '10px' } });
        });
        return true;
    }
});
