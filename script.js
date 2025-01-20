console.log('Script starting...');

// Declare canvas-related variables at the top with let
let canvas = null;
let ctx = null;
let targetLetter = null;
let resultDiv = null;
let clearButton = null;
let submitButton = null;
let currentLetter = '';
let isDrawing = false;
let timeout;

// Add tracking for learned letters
// let learntLetters = JSON.parse(localStorage.getItem('learntLetters') || '[]');
// let lastPracticeDates = JSON.parse(localStorage.getItem('lastPracticeDates') || '{}');

// Canvas state object to encapsulate drawing state
const canvasState = {
    isDrawing: false,
    canvas: null,
    ctx: null,
    targetLetter: null,
    resultDiv: null,
    clearButton: null,
    submitButton: null,
    currentLetter: ''
};

function updateLearningProgress(letter) {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const isReadMode = document.querySelector('.level-type')?.textContent.toLowerCase().includes('read');
    window.Storage.addLearntLetter(letter, isReadMode ? 'read' : 'write');
}

// Initialize canvas elements if on practice page
function initializeCanvasElements() {
    canvasState.canvas = document.querySelector('#drawingCanvas');
    canvasState.targetLetter = document.querySelector('#targetLetter');
    canvasState.resultDiv = document.querySelector('#result');
    canvasState.clearButton = document.querySelector('#clearCanvas');
    canvasState.submitButton = document.querySelector('#submitDrawing');

    if (!canvasState.canvas) {
        console.error('Canvas element not found');
        return false;
    }

    canvasState.ctx = canvasState.canvas.getContext('2d');
    if (!canvasState.ctx) {
        console.error('Could not get canvas context');
        return false;
    }

    return true;
}

// Add this function to update progress bars
function updateProgressBars() {
    const levels = document.querySelectorAll('.level');
    console.log('Found levels:', levels.length);
    
    levels.forEach((level, index) => {
        const progressBar = level.querySelector('.progress');
        if (!progressBar) {
            console.error(`No progress bar found for level ${index + 1}`);
            return;
        }

        const levelHeader = level.querySelector('h2');
        if (!levelHeader) {
            console.error(`No header found for level ${index + 1}`);
            return;
        }

        const levelType = levelHeader.textContent.toLowerCase();
        const levelTypeElement = level.querySelector('.level-type');
        const mode = levelTypeElement && levelTypeElement.textContent.toLowerCase().includes('read') ? 'read' : 'write';
        
        // Get progress directly from Storage
        const progress = window.Storage.getLevelProgress(levelType, mode);
        console.log(`Progress for ${levelType} (${mode}):`, progress);

        // Update progress bar width
        progressBar.style.width = `${progress}%`;
        
        // Remove any existing progress text
        const existingProgressText = progressBar.querySelector('.progress-text');
        if (existingProgressText) {
            existingProgressText.remove();
        }
    });
}

// Initialize
function init() {
    if (window.location.pathname.includes('practice.html')) {
        if (!initializeCanvasElements()) return;
        
        // Check if we're in free learn mode
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'free') {
            const selectedLetter = localStorage.getItem('selectedLetter');
            if (selectedLetter) {
                currentLetter = selectedLetter;
                targetLetter.textContent = currentLetter;
            } else {
                setNewLetter();
            }
        } else {
            setNewLetter();
        }
        
        setupCanvas();
    }
}

function setNewLetter() {
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level') || 'vowels';
    console.log('Current level:', level);

    let availableLetters = [];
    if (level === 'vowels') {
        availableLetters = window.letters?.vowels || [];
    } else if (level.startsWith('consonants_')) {
        const consonantGroup = level.replace('consonants_', '');
        availableLetters = window.letters?.consonants?.[consonantGroup] || [];
    }

    if (!availableLetters || availableLetters.length === 0) {
        console.log('No letters available for level:', level);
        canvasState.targetLetter.innerHTML = `
            <div class="letter">❌</div>
            <div class="transliteration">Error: Invalid level</div>
            <div class="example">Please select a valid level</div>
            <div class="example-transliteration">
                <a href="index.html" class="nav-button">Back to Home</a>
            </div>
        `;
        return;
    }

    // Get learnt letters
    const learntLetters = window.Storage?.getLearntLetters() || [];
    console.log('Learnt letters:', learntLetters);

    // Filter out learnt letters
    const unlearntLetters = availableLetters.filter(letter => 
        !learntLetters.includes(letter.letter)
    );
    console.log('Unlearnt letters:', unlearntLetters);

    if (unlearntLetters.length === 0) {
        canvasState.targetLetter.innerHTML = `
            <div class="letter">🎉</div>
            <div class="transliteration">Congratulations!</div>
            <div class="example">You have learned all letters in this level</div>
            <div class="example-transliteration">
                <a href="index.html" class="nav-button">Back to Home</a>
            </div>
        `;
        return;
    }

    // Select a random unlearnt letter
    const randomIndex = Math.floor(Math.random() * unlearntLetters.length);
    const selectedLetter = unlearntLetters[randomIndex];
    canvasState.currentLetter = selectedLetter;

    // Display the letter and its details
    canvasState.targetLetter.innerHTML = `
        <div class="letter">${selectedLetter.letter}</div>
        <div class="transliteration">${selectedLetter.transliteration}</div>
        <div class="pronunciation">${selectedLetter.pronunciation}</div>
        <div class="example">${selectedLetter.examples?.[0] || ''}</div>
    `;
}

function getAllLetters() {
    // Flatten the categorized letters into a single array
    return [
        ...kannadaLetters.vowels,
        ...kannadaLetters.consonants,
        ...kannadaLetters.numbers
    ];
}

function setRandomLetter() {
    const allLetters = window.getAllLetters();
    const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
    currentLetter = randomLetter.letter;
    targetLetter.innerHTML = `
        <div class="letter">${randomLetter.letter}</div>
        <div class="transliteration">${randomLetter.transliteration}</div>
        <div class="example">${randomLetter.example}</div>
        <div class="example-transliteration">${randomLetter.exampleTransliteration}</div>
    `;
}

function setupCanvas() {
    if (!initializeCanvasElements()) {
        console.error('Failed to initialize canvas elements');
        return false;
    }

    // Set canvas size to match display size
    const rect = canvasState.canvas.getBoundingClientRect();
    canvasState.canvas.width = rect.width;
    canvasState.canvas.height = rect.height;
    
    // Set drawing styles
    canvasState.ctx.strokeStyle = '#000';
    canvasState.ctx.lineWidth = 3;
    canvasState.ctx.lineCap = 'round';
    canvasState.ctx.lineJoin = 'round';
    
    // Add event listeners
    canvasState.canvas.addEventListener('mousedown', startDrawing);
    canvasState.canvas.addEventListener('mousemove', draw);
    canvasState.canvas.addEventListener('mouseup', stopDrawing);
    canvasState.canvas.addEventListener('mouseout', stopDrawing);
    
    canvasState.canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvasState.canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvasState.canvas.addEventListener('touchend', stopDrawing);
    
    canvasState.clearButton.addEventListener('click', clearCanvas);
    canvasState.submitButton.addEventListener('click', checkDrawing);

    return true;
}

function startDrawing(e) {
    if (!canvasState.ctx) return;
    canvasState.isDrawing = true;
    if (canvasState.resultDiv) {
        canvasState.resultDiv.textContent = '';
    }
    
    // Initialize the path without drawing
    const rect = canvasState.canvas.getBoundingClientRect();
    let x, y;
    
    if (e.type.startsWith('touch')) {
        const touch = e.touches[0];
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    
    canvasState.ctx.beginPath();
    canvasState.ctx.moveTo(x, y);
}

function draw(e) {
    // Early return before any operations if not drawing
    if (!canvasState.isDrawing) return;
    if (!canvasState.ctx || !canvasState.canvas) return;
    
    let x, y;
    const rect = canvasState.canvas.getBoundingClientRect();
    
    if (e.type.startsWith('touch')) {
        const touch = e.touches[0];
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    
    canvasState.ctx.lineTo(x, y);
    canvasState.ctx.stroke();
    canvasState.ctx.beginPath();
    canvasState.ctx.moveTo(x, y);
}

function stopDrawing() {
    canvasState.isDrawing = false;
    if (canvasState.ctx) {
        canvasState.ctx.beginPath();
    }
}

function handleTouch(e) {
    console.log('Touch Event Type:', e.type);
    e.preventDefault();
    
    if (e.type === 'touchstart') {
        document.body.classList.add('drawing');
        startDrawing(e);
    } else if (e.type === 'touchmove') {
        draw(e);
    }
}

function clearCanvas() {
    if (!canvasState.ctx || !canvasState.canvas) return;
    canvasState.ctx.clearRect(0, 0, canvasState.canvas.width, canvasState.canvas.height);
    if (canvasState.resultDiv) {
        canvasState.resultDiv.textContent = '';
    }
}

function checkDrawing() {
    if (!canvasState.ctx || !canvasState.canvas) return;
    
    const imageData = canvasState.ctx.getImageData(0, 0, canvasState.canvas.width, canvasState.canvas.height);
    
    // Check if anything has been drawn
    let hasDrawing = false;
    for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) {
            hasDrawing = true;
            break;
        }
    }

    if (!hasDrawing) {
        if (canvasState.resultDiv) {
            canvasState.resultDiv.textContent = 'Please draw something first!';
        }
        return;
    }

    const similarity = calculateSimilarity(imageData);
    
    let message;
    if (similarity < 5) {
        message = `Try again! (${Math.round(similarity)}% match)`;
    } else if (similarity >= 5 && similarity < 10) {
        message = `Almost there! (${Math.round(similarity)}% match)`;
    } else {
        message = `Success! (${Math.round(similarity)}% match)`;
        
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        if (mode === 'learn') {
            updateLearningProgress(canvasState.currentLetter);
        }
        
        setTimeout(() => {
            clearCanvas();
            setNewLetter();
            if (canvasState.resultDiv) {
                canvasState.resultDiv.textContent = '';
            }
        }, 2000);
    }
    
    if (canvasState.resultDiv) {
        canvasState.resultDiv.textContent = message;
    }
}

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

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    console.log('window.letters available:', !!window.letters);
    console.log('window.Storage available:', !!window.Storage);
    
    if (window.letters && window.Storage) {
        console.log('Dependencies loaded, initializing...');
        init();
        if (window.location.pathname.includes('practice.html')) {
            console.log('On practice page, updating progress bars...');
            updateProgressBars();
        }
    } else {
        console.error('Required dependencies not loaded:');
        console.error('- window.letters:', !!window.letters);
        console.error('- window.Storage:', !!window.Storage);
    }
});

// Replace the process.env check with a simpler debug button
const isDebugMode = localStorage.getItem('debugMode') === 'true';
if (isDebugMode) {
    // Add debug button
    const debugButton = document.createElement('button');
    debugButton.style.position = 'fixed';
    debugButton.style.bottom = '10px';
    debugButton.style.right = '10px';
    debugButton.style.zIndex = '9999';
    debugButton.textContent = 'Debug Storage';
    debugButton.onclick = () => {
        console.log('Current Storage State:', {
            learntLetters: window.Storage.getLearntLetters(),
            levelProgress: {
                vowels_write: window.Storage.getLevelProgress('vowels', 'write'),
                vowels_read: window.Storage.getLevelProgress('vowels', 'read'),
                consonants_write: window.Storage.getLevelProgress('consonants', 'write')
            }
        });
        // Force update
        window.Storage.updateLevelProgress();
        updateProgressBars();
    };
    document.body.appendChild(debugButton);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setNewLetter,
        setupCanvas,
        startDrawing,
        stopDrawing,
        draw,
        clearCanvas,
        checkDrawing,
        calculateSimilarity,
        initializeCanvasElements,
        // Export state management for testing
        getState: () => ({ ...canvasState }),
        setState: (newState) => {
            Object.assign(canvasState, newState);
        }
    };
} 