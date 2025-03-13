let offsetX, offsetY;

function getSquare()
{
    const timeSquare = document.createElement('div');
    timeSquare.id = "TimeItSquare";
    timeSquare.style.width = '200px';
    timeSquare.style.height = '100px';
    timeSquare.style.position = 'fixed';
    timeSquare.style.zIndex = '1000';
    timeSquare.style.boxShadow = '0 0 0 2px white';
    return timeSquare;
}

function loadSquarePosition() {
    let timeSquare = document.getElementById("TimeItSquare");
    browser.runtime.sendMessage({ action: "getSquarePosition" }).then(response => {
        const position = response.position;
        timeSquare.style.left = position.left || '10px';
        timeSquare.style.top = position.top || '10px';
        updateBorderRadius();
    });
}

function setSquareColor() {
    let timeSquare = document.getElementById("TimeItSquare");
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkMode) {
        timeSquare.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    } else {
        // Set a darker color for light mode
        timeSquare.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    }
}

function updateBorderRadius() {
    let timeSquare = document.getElementById("TimeItSquare");
    const rect = timeSquare.getBoundingClientRect();
    const distances = {
        left: rect.left,
        right: window.innerWidth - rect.right,
        top: rect.top,
        bottom: window.innerHeight - rect.bottom
    };

    // Set border-radius based on snapped edges
    if(distances.top <= 0) {
        timeSquare.style.borderRadius = "0 0 10px 10px";
    }
    else if (distances.bottom <= 0) {
        timeSquare.style.borderRadius = "10px 10px 0 0";
    }
    else if (distances.left <= 0) {
        timeSquare.style.borderRadius = "0 10px 10px 0";
    }
    else if (distances.right <= 0) {
        timeSquare.style.borderRadius = "10px 0 0 10px";
    }
    else {
        defaultBorderRadius();
    }
}

function defaultBorderRadius(){
    let timeSquare = document.getElementById("TimeItSquare");
    timeSquare.style.borderRadius = "10px 10px 10px 10px";
}


document.addEventListener('visibilitychange', () => {
    if (document.getElementById("TimeItSquare") && document.visibilityState === 'visible') {
        loadSquarePosition();
    }
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    setSquareColor();
});



function mouseMoveHandler(e) {
    let timeSquare = document.getElementById("TimeItSquare");
    
    timeSquare.style.left = `${e.clientX - offsetX}px`;
    timeSquare.style.top = `${e.clientY - offsetY}px`;
}

browser.storage.local.get("savedSites").then((data) => {
    let sites = data.savedSites || [];
    let currentDomain = window.location.hostname.replace(/^www\./, "");

    if (sites.some(site => currentDomain.endsWith(site))) { 
        addSquare();
    }
});

function mouseUpHandler() {
    let timeSquare = document.getElementById("TimeItSquare");
    const rect = timeSquare.getBoundingClientRect();
    
    const distances = {
        left: rect.left,
        right: window.innerWidth - rect.right,
        top: rect.top,
        bottom: window.innerHeight - rect.bottom
    };

    const closestEdge = Math.min(distances.left, distances.right, distances.top, distances.bottom);

    // Snap to the closest edge
    if (closestEdge === distances.left) {
        timeSquare.style.left = '0px';
        timeSquare.style.top = `${rect.top}px`;
    } else if (closestEdge === distances.right) {
        timeSquare.style.left = `${window.innerWidth - rect.width}px`;
        timeSquare.style.top = `${rect.top}px`;
    } else if (closestEdge === distances.top) {
        timeSquare.style.top = '0px';
        timeSquare.style.left = `${rect.left}px`;
    } else if (closestEdge === distances.bottom) {
        timeSquare.style.top = `${window.innerHeight - rect.height}px`;
        timeSquare.style.left = `${rect.left}px`;
    }

    // Save position
    const position = {
        left: timeSquare.style.left,
        top: timeSquare.style.top
    };

    browser.runtime.sendMessage({ action: "saveSquarePosition", position });

    updateBorderRadius();

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
}

browser.runtime.onMessage.addListener((message) => {
    if (message.action === "addSquare") {
        addSquare();
    } else if (message.action === "removeSquare") {
        removeSquare();
    }
});


function removeSquare()
{
    let square = document.getElementById("TimeItSquare");
    if (square) {
        square.remove();
    }
}

function addSquare() {
    if (!document.getElementById("TimeItSquare")) {
        browser.runtime.sendMessage({ action: "getSquarePosition" }).then(response => {
            const position = response.position || {};
            let timeSquare = getSquare();


            timeSquare.style.left = position.left || '10px';
            timeSquare.style.top = position.top || '10px';

            document.body.appendChild(timeSquare);
            setSquareColor();

            timeSquare.addEventListener('mousedown', (e) => {
                offsetX = e.clientX - timeSquare.getBoundingClientRect().left;
                offsetY = e.clientY - timeSquare.getBoundingClientRect().top;
                defaultBorderRadius();
                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
            });

            updateBorderRadius();
        }).catch(error => console.error("Failed to get square position:", error));
    }
}

