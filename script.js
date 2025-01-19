// First, let's add debug logs for initialization
console.log('Script starting...');

// Get DOM elements
const canvas = document.getElementById('drawingCanvas');
console.log('Canvas element:', canvas);

const ctx = canvas?.getContext('2d');
console.log('Canvas context:', ctx);

const targetLetter = document.getElementById('targetLetter');
console.log('Target letter element:', targetLetter);

const clearButton = document.getElementById('clearCanvas');
console.log('Clear button:', clearButton);

const submitButton = document.getElementById('submitDrawing');
console.log('Submit button:', submitButton);

const resultDiv = document.getElementById('result');
console.log('Result div:', resultDiv);

// Check if we have all necessary elements
if (!canvas || !ctx || !targetLetter || !clearButton || !submitButton || !resultDiv) {
    console.error('Missing required elements!');
    throw new Error('Missing required elements');
}

let currentLetter;
let isDrawing = false;
let timeout;

// Add tracking for learned letters
let learntLetters = JSON.parse(localStorage.getItem('learntLetters') || '[]');
let lastPracticeDates = JSON.parse(localStorage.getItem('lastPracticeDates') || '{}');

function updateLearningProgress(letter) {
    if (!learntLetters.includes(letter)) {
        learntLetters.push(letter);
        localStorage.setItem('learntLetters', JSON.stringify(learntLetters));
    }
    lastPracticeDates[letter] = Date.now();
    localStorage.setItem('lastPracticeDates', JSON.stringify(lastPracticeDates));
}

// Initialize
function init() {
    // Check if we're in free learn mode
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'free') {
        // Get the selected letter from localStorage
        const selectedLetter = localStorage.getItem('selectedLetter');
        if (selectedLetter) {
            currentLetter = selectedLetter;
            targetLetter.textContent = currentLetter;
        } else {
            // Fallback to random if no letter selected
            setNewLetter();
        }
    } else {
        setNewLetter();
    }
    
    setupCanvas();
}

function setNewLetter() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'learn') {
        const currentLevel = localStorage.getItem('currentLevel') || 'vowels';
        let availableLetters;
        
        // Select letters based on current level
        switch(currentLevel) {
            case 'vowels':
                availableLetters = kannadaLetters.vowels;
                break;
            case 'consonants':
                availableLetters = kannadaLetters.consonants;
                break;
            case 'numbers':
                availableLetters = kannadaLetters.numbers;
                break;
            default:
                availableLetters = kannadaLetters.vowels;
        }
        
        // Filter out learned letters
        const unlearntLetters = availableLetters.filter(letterObj => 
            !learntLetters.includes(letterObj.letter)
        );
        
        if (unlearntLetters.length === 0) {
            // Level completed!
            let nextLevel = '';
            if (currentLevel === 'vowels') nextLevel = 'consonants';
            else if (currentLevel === 'consonants') nextLevel = 'numbers';
            
            targetLetter.innerHTML = `
                <div class="letter">🎉</div>
                <div class="transliteration">Level Complete!</div>
                <div class="example">${nextLevel ? `Ready for ${nextLevel}!` : 'All levels completed!'}</div>
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
        // Practice mode - existing code...
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

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the learning tree page
    const learningTree = document.querySelector('.learning-tree');
    if (!learningTree) {
        console.log('Not on learning tree page');
        return;
    }

    console.log('Initializing learning tree');

    // Initialize progress bars
    const levels = document.querySelectorAll('.level');
    levels.forEach((level, index) => {
        const progressBar = level.querySelector('.progress');
        const levelKey = `levelProgress_${index + 1}`; // Unique key for each level

        // Load saved progress
        const savedProgress = localStorage.getItem(levelKey);
        if (savedProgress) {
            progressBar.style.width = `${savedProgress}%`;
        } else {
            progressBar.style.width = '0%'; // Default to 0% if no progress
        }

        // Add click handler for start buttons
        const startButton = level.querySelector('.start-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                // Simulate learning process and update progress
                const newProgress = 100; // Set this to the actual progress value
                localStorage.setItem(levelKey, newProgress); // Save progress
                progressBar.style.width = `${newProgress}%`; // Update progress bar
            });
        }
    });
});

// Start the app
init(); 