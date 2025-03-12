const greenSquare = document.createElement('div');
greenSquare.style.width = '200px';
greenSquare.style.height = '100px';
greenSquare.style.position = 'fixed';
greenSquare.style.zIndex = '1000';
greenSquare.style.boxShadow = '0 0 0 2px white';
document.body.appendChild(greenSquare);

let offsetX, offsetY;

function loadSquarePosition() {
    browser.runtime.sendMessage({ action: "getSquarePosition" }).then(response => {
        const position = response.position;
        greenSquare.style.left = position.left || '10px';
        greenSquare.style.top = position.top || '10px';
        updateBorderRadius();
    });
}

function setSquareColor() {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDarkMode) {
        greenSquare.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    } else {
        // Set a darker color for light mode
        greenSquare.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    }
}

function updateBorderRadius() {
    const rect = greenSquare.getBoundingClientRect();
    const distances = {
        left: rect.left,
        right: window.innerWidth - rect.right,
        top: rect.top,
        bottom: window.innerHeight - rect.bottom
    };

    // Set border-radius based on snapped edges
    if(distances.top <= 0) {
        greenSquare.style.borderRadius = "0 0 10px 10px";
    }
    else if (distances.bottom <= 0) {
        greenSquare.style.borderRadius = "10px 10px 0 0";
    }
    else if (distances.left <= 0) {
        greenSquare.style.borderRadius = "0 10px 10px 0";
    }
    else if (distances.right <= 0) {
        greenSquare.style.borderRadius = "10px 0 0 10px";
    }
    else {
        defaultBorderRadius();
    }
}

function defaultBorderRadius(){
    greenSquare.style.borderRadius = "10px 10px 10px 10px";
}


document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        loadSquarePosition();
    }
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    setSquareColor(); // Update the square color when the color scheme changes
});

greenSquare.addEventListener('mousedown', (e) => {
    offsetX = e.clientX - greenSquare.getBoundingClientRect().left;
    offsetY = e.clientY - greenSquare.getBoundingClientRect().top;
    defaultBorderRadius();
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
});

function mouseMoveHandler(e) {
    greenSquare.style.left = `${e.clientX - offsetX}px`;
    greenSquare.style.top = `${e.clientY - offsetY}px`;
}

function mouseUpHandler() {
    const rect = greenSquare.getBoundingClientRect();
    
    const distances = {
        left: rect.left,
        right: window.innerWidth - rect.right,
        top: rect.top,
        bottom: window.innerHeight - rect.bottom
    };

    const closestEdge = Math.min(distances.left, distances.right, distances.top, distances.bottom);

    // Snap to the closest edge
    if (closestEdge === distances.left) {
        greenSquare.style.left = '0px';
        greenSquare.style.top = `${rect.top}px`;
    } else if (closestEdge === distances.right) {
        greenSquare.style.left = `${window.innerWidth - rect.width}px`;
        greenSquare.style.top = `${rect.top}px`;
    } else if (closestEdge === distances.top) {
        greenSquare.style.top = '0px';
        greenSquare.style.left = `${rect.left}px`;
    } else if (closestEdge === distances.bottom) {
        greenSquare.style.top = `${window.innerHeight - rect.height}px`;
        greenSquare.style.left = `${rect.left}px`;
    }

    // Save position
    const position = {
        left: greenSquare.style.left,
        top: greenSquare.style.top
    };

    browser.runtime.sendMessage({ action: "saveSquarePosition", position });

    updateBorderRadius();

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
}

loadSquarePosition();
setSquareColor();