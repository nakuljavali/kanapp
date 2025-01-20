console.log('Script starting...');

// Declare canvas-related variables at the top with let
let canvas, ctx, targetLetter, clearButton, submitButton, resultDiv;
let currentLetter;
let isDrawing = false;
let timeout;

// Add tracking for learned letters
// let learntLetters = JSON.parse(localStorage.getItem('learntLetters') || '[]');
// let lastPracticeDates = JSON.parse(localStorage.getItem('lastPracticeDates') || '{}');

function updateLearningProgress(letter) {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const isReadMode = document.querySelector('.level-type')?.textContent.toLowerCase().includes('read');
    window.Storage.addLearntLetter(letter, isReadMode ? 'read' : 'write');
}

// Initialize canvas elements if on practice page
function initializeCanvasElements() {
    if (!window.location.pathname.includes('practice.html')) return false;

    canvas = document.getElementById('drawingCanvas');
    console.log('Canvas element:', canvas);

    ctx = canvas?.getContext('2d');
    console.log('Canvas context:', ctx);

    targetLetter = document.getElementById('targetLetter');
    console.log('Target letter element:', targetLetter);

    clearButton = document.getElementById('clearCanvas');
    console.log('Clear button:', clearButton);

    submitButton = document.getElementById('submitDrawing');
    console.log('Submit button:', submitButton);

    resultDiv = document.getElementById('result');
    console.log('Result div:', resultDiv);

    // Check if we have all necessary elements for practice page
    if (!canvas || !ctx || !targetLetter || !clearButton || !submitButton || !resultDiv) {
        console.error('Missing required elements for practice page!');
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
    const mode = urlParams.get('mode');
    const level = urlParams.get('level') || 'vowels';
    
    if (mode === 'learn') {
        let availableLetters;
        
        // Select letters based on current level
        if (level === 'vowels') {
            availableLetters = window.letters.vowels;
        } else if (level.startsWith('consonants_')) {
            // Extract the consonant group (e.g., 'velar' from 'consonants_velar')
            const group = level.split('_')[1];
            availableLetters = window.letters.consonants[group] || [];
        }
        
        if (!availableLetters || availableLetters.length === 0) {
            console.error('No letters available for level:', level);
            targetLetter.innerHTML = `
                <div class="letter">❌</div>
                <div class="transliteration">Error: Invalid level</div>
            `;
            return;
        }
        
        // Filter out learned letters
        const learntLetters = window.Storage.getLearntLetters();
        const unlearntLetters = availableLetters.filter(letterObj => 
            !learntLetters.includes(letterObj.letter)
        );
        
        if (unlearntLetters.length === 0) {
            // Level completed!
            targetLetter.innerHTML = `
                <div class="letter">🎉</div>
                <div class="transliteration">Level Complete!</div>
                <div class="example">Great job! Try the next level.</div>
                <div class="example-transliteration">
                    <a href="index.html" class="nav-button">Back to Home</a>
                </div>
            `;
            return;
        }
        
        // Get a random unlearned letter
        const randomLetter = unlearntLetters[Math.floor(Math.random() * unlearntLetters.length)];
        currentLetter = randomLetter.letter;
        targetLetter.innerHTML = `
            <div class="letter">${randomLetter.letter}</div>
            <div class="transliteration">${randomLetter.transliteration}</div>
            <div class="example">${randomLetter.pronunciation}</div>
            <div class="example-transliteration">${randomLetter.examples}</div>
        `;
    } else {
        // Practice mode - get a random letter from the current level only
        let availableLetters;
        if (level === 'vowels') {
            availableLetters = window.letters.vowels;
        } else if (level.startsWith('consonants_')) {
            const group = level.split('_')[1];
            availableLetters = window.letters.consonants[group] || [];
        }
        
        if (!availableLetters || availableLetters.length === 0) {
            console.error('No letters available for level:', level);
            return;
        }
        
        const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
        currentLetter = randomLetter.letter;
        targetLetter.innerHTML = `
            <div class="letter">${randomLetter.letter}</div>
            <div class="transliteration">${randomLetter.transliteration}</div>
            <div class="example">${randomLetter.pronunciation}</div>
            <div class="example-transliteration">${randomLetter.examples}</div>
        `;
    }
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
    console.log('Setting up canvas:', {
        width: canvas.width,
        height: canvas.height,
        boundingWidth: canvas.getBoundingClientRect().width,
        boundingHeight: canvas.getBoundingClientRect().height
    });
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    
    clearButton.addEventListener('click', clearCanvas);
    submitButton.addEventListener('click', checkDrawing);
    
    console.log('Canvas setup complete');
}

function startDrawing(e) {
    console.log('StartDrawing Event:', e.type);
    isDrawing = true;
    resultDiv.textContent = '';
    
    let x, y;
    if (e.type === 'mousedown') {
        const rect = canvas.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        console.log('Mouse Down Event:', {
            clientX: e.clientX,
            clientY: e.clientY,
            rectLeft: rect.left,
            rectTop: rect.top,
            calculatedX: x,
            calculatedY: y
        });
    } else if (e.type === 'touchstart') {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
        console.log('Touch Start Event:', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            rectLeft: rect.left,
            rectTop: rect.top,
            calculatedX: x,
            calculatedY: y
        });
    }
    
    // Scale coordinates
    const scaledX = x * (canvas.width / canvas.getBoundingClientRect().width);
    const scaledY = y * (canvas.height / canvas.getBoundingClientRect().height);
    
    console.log('Start Drawing coordinates:', {
        originalX: x,
        originalY: y,
        scaledX: scaledX,
        scaledY: scaledY
    });
    
    ctx.beginPath();
    ctx.moveTo(scaledX, scaledY);
}

function draw(e) {
    if (!isDrawing) {
        console.log('Not drawing - isDrawing is false');
        return;
    }
    
    let x, y;
    
    if (e.type === 'mousemove') {
        const rect = canvas.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        console.log('Mouse Move Event:', {
            clientX: e.clientX,
            clientY: e.clientY,
            rectLeft: rect.left,
            rectTop: rect.top,
            calculatedX: x,
            calculatedY: y
        });
    } else if (e.type === 'touchmove') {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
        console.log('Touch Move Event:', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            rectLeft: rect.left,
            rectTop: rect.top,
            calculatedX: x,
            calculatedY: y
        });
    }
    
    // Scale coordinates
    const scaledX = x * (canvas.width / canvas.getBoundingClientRect().width);
    const scaledY = y * (canvas.height / canvas.getBoundingClientRect().height);
    
    console.log('Drawing coordinates:', {
        originalX: x,
        originalY: y,
        scaledX: scaledX,
        scaledY: scaledY,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        boundingWidth: canvas.getBoundingClientRect().width,
        boundingHeight: canvas.getBoundingClientRect().height
    });
    
    ctx.lineTo(scaledX, scaledY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(scaledX, scaledY);
    
    clearTimeout(timeout);
    timeout = setTimeout(checkDrawing, 2000);
}

function stopDrawing() {
    console.log('Stop Drawing Event');
    isDrawing = false;
    ctx.beginPath();
    document.body.classList.remove('drawing');
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Don't clear the result message when manually clearing canvas
}

function checkDrawing() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const similarity = calculateSimilarity(imageData);
    
    let message;
    if (similarity < 1) {
        message = `Try again! (Debug: ${similarity}% match)`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else if (similarity >= 1 && similarity < 5) {
        message = `Almost there! (Debug: ${similarity}% match)`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
        message = `Success! (Debug: ${similarity}% match)`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update learning progress for learn mode
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        if (mode === 'learn') {
            updateLearningProgress(currentLetter);
        }
        
        setTimeout(() => {
            setNewLetter();
            resultDiv.textContent = '';
        }, 2000);
    }
    
    resultDiv.textContent = message;
}

function calculateSimilarity(imageData) {
    // This is a simplified similarity check
    // In a real app, you'd want to use ML or better pattern recognition
    let nonEmptyPixels = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i + 3] > 0) { // Check alpha channel
            nonEmptyPixels++;
        }
    }
    
    // Calculate a basic similarity score
    const totalPixels = canvas.width * canvas.height;
    const coverage = (nonEmptyPixels / totalPixels) * 100;
    
    // Return a normalized score between 0 and 100
    return Math.min(Math.max(coverage * 5, 0), 100);
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Initialize based on current page
    if (window.location.pathname.includes('practice.html')) {
        init();
    } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        // Home page initialization (progress bars)
        const checkDependencies = () => {
            if (window.letters && window.Storage && typeof window.Storage.getLearntLetters === 'function') {
                console.log('Dependencies loaded, updating progress bars');
                updateProgressBars();
            } else {
                console.log('Waiting for dependencies...', {
                    letters: !!window.letters,
                    storage: !!window.Storage,
                    getLearntLetters: window.Storage?.getLearntLetters
                });
                setTimeout(checkDependencies, 100);
            }
        };
        checkDependencies();
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