let canvas, ctx;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function initializeCanvas() {
    const canvas = document.getElementById('drawingCanvas');
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Set drawing styles
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
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

    return { canvas, ctx };
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
    if (!window.canvasState?.ctx || !window.canvasState?.canvas) return;
    window.canvasState.ctx.clearRect(0, 0, window.canvasState.canvas.width, window.canvasState.canvas.height);
    if (window.canvasState.resultDiv) {
        window.canvasState.resultDiv.textContent = '';
    }
}

function getTargetLetterData(letter) {
    if (!letter?.letter) return null;
    
    const offScreenCanvas = document.createElement('canvas');
    const offScreenCtx = offScreenCanvas.getContext('2d');

    offScreenCanvas.width = 400;
    offScreenCanvas.height = 400;

    offScreenCtx.font = '48px Arial';
    offScreenCtx.textAlign = 'center';
    offScreenCtx.textBaseline = 'middle';
    offScreenCtx.fillStyle = 'black';
    offScreenCtx.fillText(letter.letter, offScreenCanvas.width / 2, offScreenCanvas.height / 2);

    return offScreenCtx.getImageData(0, 0, offScreenCanvas.width, offScreenCanvas.height);
}

function getDrawingData() {
    if (!window.canvasState?.ctx || !window.canvasState?.canvas) return null;
    return window.canvasState.ctx.getImageData(0, 0, window.canvasState.canvas.width, window.canvasState.canvas.height);
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

// Make functions available globally
window.initializeCanvas = initializeCanvas;
window.clearCanvas = clearCanvas;
window.getTargetLetterData = getTargetLetterData;
window.getDrawingData = getDrawingData;
window.calculateSimilarity = calculateSimilarity; 