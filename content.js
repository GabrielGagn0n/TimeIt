let offsetX, offsetY;
let timerInterval;
let seconds = 0;

function getSquare()
{
    const timeSquare = document.createElement('div');
    timeSquare.id = "TimeItSquare";
    timeSquare.style.width = '200px';
    timeSquare.style.height = '100px';
    timeSquare.style.position = 'fixed';
    timeSquare.style.zIndex = '1000';    
    timeSquare.style.display = 'flex';
    timeSquare.style.alignItems = 'center';
    timeSquare.style.justifyContent = 'center';
    timeSquare.style.fontFamily = 'Arial, sans-serif';
    timeSquare.style.fontWeight = 'bold';
    timeSquare.style.boxShadow = '0 0 0 3px white';

    const timerDisplay = document.createElement('div');
    timerDisplay.id = "TimerDisplay";
    timerDisplay.style.color = 'white';
    timerDisplay.style.fontSize = '26px';
    timerDisplay.style.lineHeight = '100px'; // Center vertically
    timerDisplay.style.fontFamily = "Arial";
    timerDisplay.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)';
    timeSquare.appendChild(timerDisplay);

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
        timeSquare.style.borderRadius = "0 0 12px 12px";
    }
    else if (distances.bottom <= 0) {
        timeSquare.style.borderRadius = "12px 12px 0 0";
    }
    else if (distances.left <= 0) {
        timeSquare.style.borderRadius = "0 12px 12px 0";
    }
    else if (distances.right <= 0) {
        timeSquare.style.borderRadius = "12px 0 0 12px";
    }
    else {
        defaultBorderRadius();
    }
}

function defaultBorderRadius(){
    let timeSquare = document.getElementById("TimeItSquare");
    timeSquare.style.borderRadius = "12px";
}


document.addEventListener('visibilitychange', () => {
    if (document.getElementById("TimeItSquare")) {
        if (document.visibilityState === 'visible') {
            loadSquarePosition();
            startTimer();
        } else {
            stopTimer();
        }
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

document.addEventListener('DOMContentLoaded', () => {
    browser.storage.local.get("savedSites").then((data) => {
        let sites = data.savedSites || [];
        let currentDomain = window.location.hostname.replace(/^www\./, "");

        if (sites.some(site => currentDomain.endsWith(site))) { 
            addSquare();
        }
    });
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

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            seconds++;
            updateTimerDisplay();
            const currentDomain = window.location.hostname.replace(/^www\./, "");
            browser.storage.local.set({ timers: { [currentDomain]: seconds } });
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null; // Reset the timer interval
}

function removeSquare()
{
    let square = document.getElementById("TimeItSquare");
    if (square) {
        clearInterval(timerInterval);
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

            const currentDomain = window.location.hostname.replace(/^www\./, "");
            browser.storage.local.get("timers").then((result) => {
                const timers = result.timers || {};
                seconds = timers[currentDomain] || 0;
                updateTimerDisplay();
            });

            if (document.visibilityState === 'visible') {
                startTimer();
            }

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

function updateTimerDisplay() {
    const timerDisplay = document.getElementById("TimerDisplay");
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${hh}:${mm}:${ss}`;
}

