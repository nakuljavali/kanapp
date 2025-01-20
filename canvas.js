let canvas, ctx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function initializeCanvas(canvasId) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    });
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getCoordinates(e);
}

function draw(e) {
    if (!isDrawing) return;

    const [x, y] = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    [lastX, lastY] = [x, y];
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath(); // Reset the path
}

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return [x, y];
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getTargetLetterData(letter) {
    const offScreenCanvas = document.createElement('canvas');
    const offScreenCtx = offScreenCanvas.getContext('2d');

    offScreenCanvas.width = 400; // Match your drawing canvas width
    offScreenCanvas.height = 400; // Match your drawing canvas height

    offScreenCtx.font = '48px Arial'; // Adjust font size and family as needed
    offScreenCtx.textAlign = 'center';
    offScreenCtx.textBaseline = 'middle';

    offScreenCtx.fillStyle = 'black'; // Set the color for the letter (should match the drawing color)
    offScreenCtx.fillText(letter.letter, offScreenCanvas.width / 2, offScreenCanvas.height / 2);

    return offScreenCtx.getImageData(0, 0, offScreenCanvas.width, offScreenCanvas.height);
}

function getDrawingData() {
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Canvas utility functions
function calculateSimilarity(imageData) {
    if (!imageData) return 0;
    
    let drawnPixels = 0;
    const data = imageData.data;
    const totalPixels = imageData.width * imageData.height;
    
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) {
            drawnPixels++;
        }
    }
    
    const percentageDrawn = (drawnPixels / totalPixels) * 100;
    const normalizedScore = Math.min(Math.max((percentageDrawn - 0.5) * 10, 0), 100);
    
    return normalizedScore;
}

// Add functions to window object for access from other files
window.getDrawingData = getDrawingData;
window.clearCanvas = clearCanvas;
window.getTargetLetterData = getTargetLetterData;
window.calculateSimilarity = calculateSimilarity; 