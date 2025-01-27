console.log('Script starting...');

// Canvas state object to encapsulate drawing state
const canvasState = {
    isDrawing: false,
    canvas: null,
    ctx: null,
    targetLetter: null,
    resultDiv: null,
    clearButton: null,
    submitButton: null,
    currentLetter: null,
    lastX: 0,
    lastY: 0,
    initRetryCount: 0,
    drawingTimeout: null,
    lastDrawTime: null,
    feedbackTimeout: null
};

// Make canvasState accessible to other files
window.canvasState = canvasState;

function updateLearningProgress(letter) {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const isReadMode = document.querySelector('.level-type')?.textContent.toLowerCase().includes('read');
    window.Storage.addLearntLetter(letter, isReadMode ? 'read' : 'write');
}

function initializeCanvasElements() {
    console.log('Initializing canvas elements...');
    
    // Get DOM elements
    canvasState.canvas = document.querySelector('#drawingCanvas');
    canvasState.targetLetter = document.querySelector('#targetLetter');
    canvasState.resultDiv = document.querySelector('#result');
    canvasState.clearButton = document.querySelector('#clearCanvas');
    canvasState.submitButton = document.querySelector('#submitDrawing');

    console.log('Canvas elements found:', {
        canvas: !!canvasState.canvas,
        targetLetter: !!canvasState.targetLetter,
        resultDiv: !!canvasState.resultDiv,
        clearButton: !!canvasState.clearButton,
        submitButton: !!canvasState.submitButton
    });

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

        // Get level ID from the level element or data attribute
        let levelId;
        const levelHeader = level.querySelector('h2');
        if (!levelHeader) {
            console.error(`No header found for level ${index + 1}`);
            return;
        }

        const levelTitle = levelHeader.textContent;
        const levelTypeElement = level.querySelector('.level-type');
        const mode = levelTypeElement && levelTypeElement.textContent.toLowerCase().includes('read') ? 'read' : 'write';

        // Extract level ID from the title
        if (levelTitle.toLowerCase().includes('vowels')) {
            levelId = 'vowels';
        } else if (levelTitle.toLowerCase().includes('consonants')) {
            // Extract the consonant group (e.g., "palatal" from "Consonants - Palatal (ಚ ವರ್ಗ)")
            const match = levelTitle.match(/consonants\s*-\s*(\w+)/i);
            if (match) {
                const group = match[1].toLowerCase();
                levelId = `consonants_${group}`;
                console.log(`Found consonant group: ${group}, levelId: ${levelId}`);
            }
        }

        if (levelId) {
            const progress = window.Storage.getLevelProgress(levelId, mode);
            console.log(`Progress for ${levelId} (${mode}):`, progress);
            progressBar.style.width = `${progress}%`;

            // Update progress text if it exists
            const progressText = level.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = `${progress}% Complete`;
            }
        } else {
            console.error(`Could not determine level ID for level ${index + 1}`);
        }
    });
}

function setNewLetter() {
    console.log('Setting new letter...');
    
    // Get level from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level') || 'vowels';
    const mode = urlParams.get('mode');
    console.log('Current level:', level);
    
    let availableLetters = [];
    
    // Handle different level types
    if (level === 'vowels') {
        availableLetters = window.letters?.vowels || [];
        console.log('Available vowels:', availableLetters);
    } else if (level.startsWith('consonants_')) {
        const consonantGroup = level.replace('consonants_', '');
        console.log('Consonant group:', consonantGroup);
        availableLetters = window.letters?.consonants?.[consonantGroup] || [];
        console.log('Available consonants:', availableLetters);
    }
    
    // Check if we have valid letters for this level
    if (!availableLetters || availableLetters.length === 0) {
        console.error('No letters available for level:', level);
        if (canvasState.targetLetter) {
            canvasState.targetLetter.innerHTML = '<div class="error">Error: Invalid level</div>';
        }
        return;
    }
    
    // Get learnt letters
    const learntLetters = window.Storage?.getLearntLetters() || [];
    console.log('Learnt letters:', learntLetters);
    
    // Filter out learnt letters
    const unlearntLetters = availableLetters.filter(letter => 
        !learntLetters.some(learnt => learnt.letter === letter.letter)
    );
    console.log('Unlearnt letters:', unlearntLetters);
    
    // If all letters are learnt, show completion message
    if (unlearntLetters.length === 0) {
        if (canvasState.targetLetter) {
            if (mode === 'review') {
                canvasState.targetLetter.innerHTML = '<div class="completion">Daily Practice done!</div>';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                canvasState.targetLetter.innerHTML = '<div class="completion">🎉 All letters learned! Try the next level!</div>';
            }
        }
        return;
    }
    
    // Select a random unlearnt letter
    const randomIndex = Math.floor(Math.random() * unlearntLetters.length);
    const selectedLetter = unlearntLetters[randomIndex];
    console.log('Selected letter:', selectedLetter);
    
    // Update canvas state
    canvasState.currentLetter = selectedLetter;
    
    // Display the letter
    displayLetterInTarget(selectedLetter);
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
    
    // Start inactivity detection
    canvasState.lastDrawTime = Date.now();
    startInactivityCheck();
}

function startInactivityCheck() {
    // Clear any existing timeouts
    if (canvasState.drawingTimeout) {
        clearTimeout(canvasState.drawingTimeout);
    }
    
    // Set a single timeout for auto-submit
    canvasState.drawingTimeout = setTimeout(() => {
        if (canvasState.isDrawing) {
            stopDrawing();
            checkDrawing();
        }
    }, 2000);
}

function draw(e) {
    if (!canvasState.isDrawing || !canvasState.ctx || !canvasState.canvas) return;
    
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

    // Reset the auto-submit timeout
    startInactivityCheck();
}

function stopDrawing() {
    canvasState.isDrawing = false;
    if (canvasState.ctx) {
        canvasState.ctx.beginPath();
    }
    
    if (canvasState.drawingTimeout) {
        clearTimeout(canvasState.drawingTimeout);
        canvasState.drawingTimeout = null;
    }
}

function handleTouch(e) {
    e.preventDefault();
    
    if (e.type === 'touchstart') {
        document.body.classList.add('drawing');
        startDrawing(e);
    } else if (e.type === 'touchmove') {
        draw(e);
    } else if (e.type === 'touchend' || e.type === 'touchcancel') {
        document.body.classList.remove('drawing');
        stopDrawing();
    }
}

function clearCanvas() {
    if (!canvasState.ctx || !canvasState.canvas) return;
    canvasState.ctx.clearRect(0, 0, canvasState.canvas.width, canvasState.canvas.height);
    if (canvasState.resultDiv) {
        canvasState.resultDiv.textContent = '';
    }
}

function showFeedback(message, isSuccess = false) {
    if (!canvasState.resultDiv) return;
    
    // Clear any existing feedback timeout
    if (canvasState.feedbackTimeout) {
        clearTimeout(canvasState.feedbackTimeout);
    }
    
    // Add success/failure class for styling
    canvasState.resultDiv.className = 'result ' + (isSuccess ? 'success' : 'failure');
    canvasState.resultDiv.textContent = message;
    
    // Make sure the feedback is visible
    canvasState.resultDiv.style.display = 'block';
    canvasState.resultDiv.style.opacity = '1';
}

function calculateSimilarity(imageData) {
    if (!imageData) return 0;
    
    let drawnPixels = 0;
    let blackPixels = 0;
    const data = imageData.data;
    const totalPixels = imageData.width * imageData.height;
    
    // Count pixels that are drawn (not white/transparent)
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Check if pixel is not white/transparent
        if (a > 20) {  // Allow for some transparency
            drawnPixels++;
            // Check if pixel is dark (closer to black)
            if ((r + g + b) / 3 < 200) {  // More lenient threshold for dark colors
                blackPixels++;
            }
        }
    }
    
    // Calculate coverage and darkness ratios
    const coverageRatio = drawnPixels / totalPixels;
    const darknessRatio = blackPixels / drawnPixels || 0;  // Avoid division by zero
    
    // Adjust weights to be more lenient
    const score = (coverageRatio * 0.3 + darknessRatio * 0.7) * 100;
    
    // Normalize the score with a more generous curve
    return Math.min(Math.max(score * 3, 0), 100);  // Multiply by 3 to be more lenient
}

function checkDrawing() {
    let message;
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const level = urlParams.get('level');

    if (!window.canvasState.currentLetter) {
        console.error('No current letter set');
        return;
    }

    // Get the image data from the canvas
    const imageData = canvasState.ctx.getImageData(0, 0, canvasState.canvas.width, canvasState.canvas.height);
    const similarity = calculateSimilarity(imageData);
    console.log('Similarity score:', similarity);

    // Update statistics and progress
    const currentLetter = window.canvasState.currentLetter;
    const isCorrect = similarity > 30;
    window.Storage.updateLetterStats(currentLetter.letter, isCorrect, 'write');

    if (isCorrect) {
        // Add to learnt letters if not already learned
        window.Storage.addLearntLetter(currentLetter, 'write');
        
        // Get all learnt letters for this mode
        const learntLetters = window.Storage.getLearntLetters('write');
        
        // Update progress for the current level
        if (level) {
            window.Storage.updateLevelProgress(level, 'write', learntLetters);
            // Force progress bars to update
            updateProgressBars();
        }

        message = `Great match! (${Math.round(similarity)}% match) Well done!`;
        showFeedback(message, true);
        
        if (mode === 'review') {
            // Get current review letters
            const reviewLetters = JSON.parse(localStorage.getItem('reviewLetters') || '[]');
            
            // Remove the current letter from the front
            reviewLetters.shift();
            
            // Update the review letters in localStorage
            localStorage.setItem('reviewLetters', JSON.stringify(reviewLetters));
            
            // Set next letter after delay
            setTimeout(() => {
                clearCanvas();
                if (reviewLetters.length > 0) {
                    const nextLetter = reviewLetters[0];
                    // Redirect to appropriate page based on next letter's mode
                    if (nextLetter.mode !== 'write') {
                        window.location.href = 'read.html?mode=review';
                        return;
                    }
                    // Update current letter for write mode
                    window.canvasState.currentLetter = nextLetter;
                    displayLetterInTarget(nextLetter);
                } else {
                    // No more letters to review
                    showFeedback('Daily Review complete!', true);
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }
            }, 1500);
        } else {
            // Set new letter after delay for practice mode
            setTimeout(() => {
                clearCanvas();
                setNewLetter();
            }, 1500);
        }
    } else if (similarity > 15) {
        message = `Close match (${Math.round(similarity)}% match) - keep practicing!`;
        showFeedback(message, false);
        setTimeout(clearCanvas, 1500);
    } else {
        message = `Try again (${Math.round(similarity)}% match)`;
        showFeedback(message, false);
        setTimeout(clearCanvas, 1500);
    }
}

// Add CSS styles for feedback
const style = document.createElement('style');
style.textContent = `
    .result {
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
        text-align: center;
        font-weight: bold;
        transition: opacity 0.3s ease;
    }
    .result.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    .result.failure {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
`;
document.head.appendChild(style);

// Add debug logging for letters data
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    console.log('window.letters:', window.letters);
    console.log('window.Storage:', window.Storage);
    console.log('Current pathname:', window.location.pathname);
    console.log('Current search:', window.location.search);
    
    // Ensure letters.js is loaded before initializing
    if (document.querySelector('script[src="letters.js"]')) {
        console.log('Letters script already loaded');
        init();
    } else {
        console.log('Loading letters script dynamically');
        const script = document.createElement('script');
        script.src = 'letters.js';
        script.onload = () => {
            console.log('Letters script loaded dynamically');
            init();
        };
        document.head.appendChild(script);
    }
});

// Helper function to display letter in target element
function displayLetterInTarget(letterObj) {
    if (!canvasState.targetLetter || !letterObj) {
        console.error('Cannot display letter:', { 
            targetLetterExists: !!canvasState.targetLetter, 
            letterObj 
        });
        return;
    }

    console.log('Displaying letter:', letterObj);
    
    // Ensure all required fields exist
    const letter = letterObj.letter || '';
    const transliteration = letterObj.transliteration || '';
    const pronunciation = letterObj.pronunciation || '';
    const example = letterObj.examples?.[0] || '';
    
    const letterHTML = `
        <div class="letter">${letter}</div>
        <div class="transliteration">${transliteration}</div>
        ${pronunciation ? `<div class="pronunciation">${pronunciation}</div>` : ''}
        ${example ? `<div class="example">${example}</div>` : ''}
    `;
    
    console.log('Setting innerHTML to:', letterHTML);
    canvasState.targetLetter.innerHTML = letterHTML;
}

// Helper function to find a letter in all categories
function findLetterInAllCategories(targetLetter) {
    if (!window.letters) {
        console.error('window.letters not available');
        return null;
    }
    
    console.log('Searching for letter:', targetLetter);
    
    // Search in vowels
    let found = window.letters.vowels?.find(l => l.letter === targetLetter);
    if (found) {
        console.log('Found in vowels:', found);
        return found;
    }
    
    // Search in consonants (all groups)
    if (window.letters.consonants) {
        for (const group in window.letters.consonants) {
            found = window.letters.consonants[group]?.find(l => l.letter === targetLetter);
            if (found) {
                console.log('Found in consonants:', found);
                return found;
            }
        }
    }
    
    console.log('Letter not found in any category');
    return null;
}

// Add filter functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');
    const levels = document.querySelectorAll('.level');

    // Function to filter levels
    function filterLevels(mode) {
        levels.forEach(level => {
            const levelType = level.querySelector('.level-type');
            if (!levelType) return;

            const levelMode = levelType.textContent.toLowerCase();
            
            if (mode === 'all' || levelMode.includes(mode.toLowerCase())) {
                level.style.display = '';
    } else {
                level.style.display = 'none';
            }
        });
    }

    // Add click handlers to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Get selected mode and filter
            const selectedMode = button.getAttribute('data-mode');
            filterLevels(selectedMode);
        });
    });

    // Initialize with 'all' filter
    const allButton = document.querySelector('.filter-button[data-mode="all"]');
    if (allButton) {
        allButton.classList.add('active');
        filterLevels('all');
    }
}

// Add stage management functions
function initializeStages() {
    const stages = document.querySelectorAll('.stage');
    
    stages.forEach(stage => {
        const header = stage.querySelector('.stage-header');
        const content = stage.querySelector('.stage-content');
        const toggleBtn = stage.querySelector('.toggle-stage');
        const stageNumber = parseInt(stage.dataset.stage);
        
        // Add click handler for stage toggle
        header.addEventListener('click', () => {
            if (!stage.classList.contains('locked')) {
                toggleStage(stage);
            }
        });
        
        // Initialize stage state
        updateStageState(stage);
    });
}

function toggleStage(stage) {
    const content = stage.querySelector('.stage-content');
    const toggleBtn = stage.querySelector('.toggle-stage');
    const isExpanded = content.classList.contains('expanded');
    
    if (isExpanded) {
        content.classList.remove('expanded');
        toggleBtn.querySelector('.material-icons').style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('expanded');
        toggleBtn.querySelector('.material-icons').style.transform = 'rotate(180deg)';
    }
}

function updateStageState(stage) {
    const stageNumber = parseInt(stage.dataset.stage);
    const toggleBtn = stage.querySelector('.toggle-stage');
    const content = stage.querySelector('.stage-content');
    const progressBar = stage.querySelector('.stage-progress .progress');
    const progressText = stage.querySelector('.stage-progress .progress-text');
    
    // Calculate stage progress
    const progress = calculateStageProgress(stageNumber);
    
    // Update progress bar and text
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${progress}% Complete`;
    
    // Handle stage accessibility
    if (stageNumber === 1) {
        // Stage 1 is always accessible
        stage.classList.remove('locked');
        if (toggleBtn) toggleBtn.disabled = false;
        if (content) content.classList.add('expanded');
        
        // Add completed class if progress is 100%
        if (progress === 100) {
            stage.classList.add('completed');
        } else {
            stage.classList.remove('completed');
        }
    } else {
        // Check if previous stage is completed
        const prevStageProgress = calculateStageProgress(stageNumber - 1);
        const isLocked = prevStageProgress < 100;
        
        stage.classList.toggle('locked', isLocked);
        if (toggleBtn) toggleBtn.disabled = isLocked;
        
        if (!isLocked && progress === 100) {
            stage.classList.add('completed');
        } else {
            stage.classList.remove('completed');
        }
    }
}

function calculateStageProgress(stageNumber) {
    const levels = document.querySelectorAll(`.stage[data-stage="${stageNumber}"] .level`);
    if (!levels.length) return 0;
    
    let totalProgress = 0;
    levels.forEach(level => {
        const progressBar = level.querySelector('.progress');
        if (progressBar) {
            // Extract the percentage value and convert it to a number
            const progressValue = parseInt(progressBar.style.width) || 0;
            totalProgress += progressValue;
        }
    });
    
    // Calculate average progress across all levels
    const averageProgress = Math.round(totalProgress / levels.length);
    
    // If the average is very close to 100 (like 99.x%), round it up to 100
    return averageProgress >= 99 ? 100 : averageProgress;
}

// Update the init function to use DailyPractice
function init() {
    console.log('Initializing...');
    console.log('window.letters available:', !!window.letters);
    console.log('window.Storage available:', !!window.Storage);
    
    if (canvasState.initRetryCount >= 50) {
        console.error('Failed to load dependencies after 50 retries');
        if (canvasState.targetLetter) {
            canvasState.targetLetter.innerHTML = '<div class="error">Error: Failed to load required resources. Please refresh the page.</div>';
        }
        return;
    }
    
    if (!window.letters || !window.Storage) {
        console.error('Required dependencies not loaded. Retrying in 100ms...');
        canvasState.initRetryCount++;
        setTimeout(init, 100);
        return;
    }
    
    // Initialize progress bars and filters if we're on the main page
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        updateProgressBars();
        initializeFilters();
        initializeStages();
        if (window.DailyPractice) {
            window.DailyPractice.updateDailyReview();
        }
    }
    
    if (window.location.pathname.includes('practice.html')) {
        console.log('On practice page, initializing canvas...');
        if (!initializeCanvasElements()) {
            console.error('Failed to initialize canvas elements');
            return;
        }
        
        setupCanvas();
        
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'review') {
            // Handle review mode
            const reviewLetters = JSON.parse(localStorage.getItem('reviewLetters') || '[]');
            if (reviewLetters.length > 0) {
                const currentLetter = reviewLetters[0];
                canvasState.currentLetter = currentLetter;
                displayLetterInTarget(currentLetter);
            } else {
                // No more letters to review, go back to index
                window.location.href = 'index.html';
            }
        } else if (mode === 'free') {
            const selectedLetter = localStorage.getItem('selectedLetter');
            if (selectedLetter && selectedLetter.trim()) {
                let letterObj = findLetterInAllCategories(selectedLetter);
                if (!letterObj) {
                    letterObj = {
                        letter: selectedLetter,
                        transliteration: selectedLetter,
                        pronunciation: selectedLetter,
                        examples: []
                    };
                }
                canvasState.currentLetter = letterObj;
                displayLetterInTarget(letterObj);
            } else {
                setNewLetter();
            }
        } else {
            setNewLetter();
        }
    }
}

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

// Add test functions
function runTests() {
    const tests = {
        // Unit tests
        testFindLetterInAllCategories() {
            console.group('Testing findLetterInAllCategories');
            
            // Test with null window.letters
            window.letters = null;
            console.assert(findLetterInAllCategories('अ') === null, 'Should handle null letters object');
            
            // Test with empty categories
            window.letters = { vowels: [], consonants: {} };
            console.assert(findLetterInAllCategories('अ') === null, 'Should handle empty categories');
            
            // Test with valid letter
            const testLetter = { letter: 'अ', transliteration: 'a' };
            window.letters = { vowels: [testLetter] };
            console.assert(findLetterInAllCategories('अ') === testLetter, 'Should find letter in vowels');
            
            console.groupEnd();
        },
        
        testDisplayLetterInTarget() {
            console.group('Testing displayLetterInTarget');
            
            // Test with null values
            displayLetterInTarget(null);
            console.assert(canvasState.targetLetter?.innerHTML === undefined, 'Should handle null letter object');
            
            // Test with valid letter object
            const testDiv = document.createElement('div');
            canvasState.targetLetter = testDiv;
            const testLetter = {
                letter: 'अ',
                transliteration: 'a',
                pronunciation: 'ah',
                examples: ['अमर']
            };
            
            displayLetterInTarget(testLetter);
            console.assert(testDiv.querySelector('.letter')?.textContent === 'अ', 'Should display letter');
            console.assert(testDiv.querySelector('.transliteration')?.textContent === 'a', 'Should display transliteration');
            
            console.groupEnd();
        },
        
        // Integration tests
        testFreeModeInitialization() {
            console.group('Testing free mode initialization');
            
            // Setup test environment
            localStorage.setItem('selectedLetter', 'अ');
            window.letters = {
                vowels: [{ letter: 'अ', transliteration: 'a', pronunciation: 'ah', examples: ['अमर'] }]
            };
            
            // Mock DOM elements
            const targetDiv = document.createElement('div');
            document.body.appendChild(targetDiv);
            targetDiv.id = 'targetLetter';
            
            // Run initialization
            initializeCanvasElements();
            init();
            
            // Verify results
            console.assert(canvasState.currentLetter?.letter === 'अ', 'Should set current letter');
            console.assert(targetDiv.querySelector('.letter')?.textContent === 'अ', 'Should display letter in DOM');
            
            // Cleanup
            document.body.removeChild(targetDiv);
            localStorage.removeItem('selectedLetter');
            
            console.groupEnd();
        },
        
        testLetterDisplay() {
            console.group('Testing letter display');
            
            // Test with stored letter data
            localStorage.setItem('selectedLetter', 'ಅ');
            localStorage.setItem('letterData', JSON.stringify({
                letter: 'ಅ',
                transliteration: 'a',
                pronunciation: 'a as in about',
                examples: ['ಅಮ್ಮ (amma) - mother']
            }));
            
            // Mock DOM elements
            const targetDiv = document.createElement('div');
            document.body.appendChild(targetDiv);
            targetDiv.id = 'targetLetter';
            
            // Mock window.letters
            window.letters = {
                vowels: [
                    { letter: 'ಅ', transliteration: 'a', pronunciation: 'a as in about', examples: ['ಅಮ್ಮ (amma) - mother'] }
                ]
            };
            
            // Initialize canvas state
            canvasState.targetLetter = targetDiv;
            
            // Test with stored data
            init();
            console.assert(targetDiv.querySelector('.letter')?.textContent === 'ಅ', 'Should display stored letter');
            
            // Test with window.letters data
            localStorage.removeItem('letterData');
            init();
            console.assert(targetDiv.querySelector('.letter')?.textContent === 'ಅ', 'Should display letter from window.letters');
            
            // Test with fallback
            localStorage.removeItem('selectedLetter');
            window.letters = null;
            const testLetter = 'ಕ';
            localStorage.setItem('selectedLetter', testLetter);
            init();
            console.assert(targetDiv.querySelector('.letter')?.textContent === testLetter, 'Should display fallback letter');
            
            // Cleanup
            document.body.removeChild(targetDiv);
            localStorage.clear();
            
            console.groupEnd();
        },
        
        testSetNewLetter() {
            console.group('Testing setNewLetter');
            
            // Mock DOM elements
            const targetDiv = document.createElement('div');
            document.body.appendChild(targetDiv);
            targetDiv.id = 'targetLetter';
            canvasState.targetLetter = targetDiv;
            
            // Mock window.letters
            window.letters = {
                vowels: [
                    { letter: 'ಅ', transliteration: 'a', pronunciation: 'a as in about', examples: ['ಅಮ್ಮ (amma) - mother'] },
                    { letter: 'ಆ', transliteration: 'aa', pronunciation: 'a as in art', examples: ['ಆನೆ (aane) - elephant'] }
                ],
                consonants: {
                    velar: [
                        { letter: 'ಕ', transliteration: 'ka', pronunciation: 'ka as in call', examples: ['ಕಮಲ (kamala) - lotus'] }
                    ]
                }
            };
            
            // Mock Storage
            window.Storage = {
                getLearntLetters: () => [],
                addLearntLetter: () => {}
            };
            
            // Test vowels level
            window.history.pushState({}, '', '?level=vowels');
            setNewLetter();
            const vowelLetter = targetDiv.querySelector('.letter')?.textContent;
            console.assert(['ಅ', 'ಆ'].includes(vowelLetter), 'Should display a vowel');
            
            // Test consonants level
            window.history.pushState({}, '', '?level=consonants_velar');
            setNewLetter();
            console.assert(targetDiv.querySelector('.letter')?.textContent === 'ಕ', 'Should display a consonant');
            
            // Test invalid level
            window.history.pushState({}, '', '?level=invalid');
            setNewLetter();
            console.assert(targetDiv.querySelector('.error')?.textContent.includes('Invalid level'), 'Should show error for invalid level');
            
            // Cleanup
            document.body.removeChild(targetDiv);
            window.letters = null;
            window.Storage = null;
            
            console.groupEnd();
        },

        testProgressBarUpdates() {
            console.group('Testing Progress Bar Updates');
            
            // Setup test environment
            const levelDiv = document.createElement('div');
            levelDiv.className = 'level';
            levelDiv.innerHTML = `
                <div class="level-header">
                    <span class="level-type">Write</span>
                </div>
                <h2>Vowels</h2>
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
            `;
            document.body.appendChild(levelDiv);

            // Mock Storage functions
            const originalStorage = window.Storage;
            window.Storage = {
                getLevelProgress: jest.fn().mockReturnValue(50),
                updateLevelProgress: jest.fn(),
                getLearntLetters: jest.fn().mockReturnValue([]),
                addLearntLetter: jest.fn()
            };

            // Test progress bar update
            updateProgressBars();
            const progressBar = levelDiv.querySelector('.progress');
            console.assert(
                progressBar.style.width === '50%',
                'Progress bar width should be updated to 50%'
            );

            // Test with different progress values
            window.Storage.getLevelProgress.mockReturnValue(75);
            updateProgressBars();
            console.assert(
                progressBar.style.width === '75%',
                'Progress bar width should be updated to 75%'
            );

            // Test with 0% progress
            window.Storage.getLevelProgress.mockReturnValue(0);
            updateProgressBars();
            console.assert(
                progressBar.style.width === '0%',
                'Progress bar width should be updated to 0%'
            );

            // Test with 100% progress
            window.Storage.getLevelProgress.mockReturnValue(100);
            updateProgressBars();
            console.assert(
                progressBar.style.width === '100%',
                'Progress bar width should be updated to 100%'
            );

            // Cleanup
            document.body.removeChild(levelDiv);
            window.Storage = originalStorage;
            console.groupEnd();
        },

        testProgressCalculation() {
            console.group('Testing Progress Calculation');
            
            // Mock letters data
            const originalLetters = window.letters;
            window.letters = {
                vowels: [
                    { letter: 'ಅ' },
                    { letter: 'ಆ' },
                    { letter: 'ಇ' }
                ],
                consonants: {
                    velar: [
                        { letter: 'ಕ' },
                        { letter: 'ಖ' }
                    ]
                }
            };

            // Mock Storage
            const originalStorage = window.Storage;
            const mockStorage = {
                learntLetters: [],
                getLearntLetters: function(mode) {
                    return this.learntLetters;
                },
                addLearntLetter: function(letter) {
                    this.learntLetters.push(letter);
                    this.updateLevelProgress();
                },
                updateLevelProgress: jest.fn(),
                getLevelProgress: jest.fn()
            };
            window.Storage = mockStorage;

            // Test vowels progress
            mockStorage.learntLetters = [{ letter: 'ಅ' }];
            mockStorage.updateLevelProgress();
            console.assert(
                localStorage.getItem('vowels_write') === '33',
                'Vowels progress should be 33% with 1/3 letters learned'
            );

            // Test consonants progress
            mockStorage.learntLetters = [{ letter: 'ಕ' }];
            mockStorage.updateLevelProgress();
            console.assert(
                localStorage.getItem('consonants_velar_write') === '50',
                'Velar consonants progress should be 50% with 1/2 letters learned'
            );

            // Test multiple letters learned
            mockStorage.learntLetters = [
                { letter: 'ಅ' },
                { letter: 'ಆ' },
                { letter: 'ಇ' }
            ];
            mockStorage.updateLevelProgress();
            console.assert(
                localStorage.getItem('vowels_write') === '100',
                'Vowels progress should be 100% with all letters learned'
            );

            // Test progress persistence
            const progress = window.Storage.getLevelProgress('vowels', 'write');
            console.assert(
                progress === 100,
                'Progress should be retrievable after being set'
            );

            // Cleanup
            window.letters = originalLetters;
            window.Storage = originalStorage;
            localStorage.clear();
            console.groupEnd();
        },

        testProgressBarVisualUpdate() {
            console.group('Testing Progress Bar Visual Updates');
            
            // Setup test environment with multiple levels
            const testContainer = document.createElement('div');
            testContainer.innerHTML = `
                <div class="level">
                    <div class="level-header">
                        <span class="level-type">Write</span>
                    </div>
                    <h2>Vowels</h2>
                    <div class="progress-bar">
                        <div class="progress" style="width: 0%"></div>
                    </div>
                </div>
                <div class="level">
                    <div class="level-header">
                        <span class="level-type">Write</span>
                    </div>
                    <h2>Consonants - Velar</h2>
                    <div class="progress-bar">
                        <div class="progress" style="width: 0%"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(testContainer);

            // Mock Storage
            const originalStorage = window.Storage;
            window.Storage = {
                getLevelProgress: (levelType, mode) => {
                    const progressMap = {
                        'vowels': 60,
                        'consonants_velar': 40
                    };
                    return progressMap[levelType] || 0;
                }
            };

            // Test initial update
            updateProgressBars();
            
            // Check vowels progress bar
            const vowelsProgress = testContainer.querySelector('.level:first-child .progress');
            console.assert(
                vowelsProgress.style.width === '60%',
                'Vowels progress bar should show 60%'
            );

            // Check consonants progress bar
            const consonantsProgress = testContainer.querySelector('.level:last-child .progress');
            console.assert(
                consonantsProgress.style.width === '40%',
                'Consonants progress bar should show 40%'
            );

            // Test progress text is removed if exists
            const progressText = document.createElement('div');
            progressText.className = 'progress-text';
            vowelsProgress.appendChild(progressText);
            updateProgressBars();
            console.assert(
                !vowelsProgress.querySelector('.progress-text'),
                'Progress text should be removed after update'
            );

            // Cleanup
            document.body.removeChild(testContainer);
            window.Storage = originalStorage;
            console.groupEnd();
        },

        testStageManagement() {
            console.group('Testing Stage Management');
            
            // Setup test environment
            const testContainer = document.createElement('div');
            testContainer.innerHTML = `
                <div class="stage" data-stage="1">
                    <div class="stage-header">
                        <h2>Stage 1</h2>
                        <div class="stage-progress">
                            <div class="progress-bar">
                                <div class="progress" style="width: 0%"></div>
                            </div>
                            <span class="progress-text">0% Complete</span>
                        </div>
                        <button class="toggle-stage">
                            <span class="material-icons">expand_more</span>
                        </button>
                    </div>
                    <div class="stage-content">
                        <div class="level">
                            <div class="progress-bar">
                                <div class="progress" style="width: 100%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(testContainer);
            
            // Test stage progress calculation
            const progress = calculateStageProgress(1);
            console.assert(
                progress === 100,
                'Stage progress should be 100% when all levels are completed'
            );
            
            // Test stage state update
            const stage = testContainer.querySelector('.stage');
            updateStageState(stage);
            console.assert(
                !stage.classList.contains('locked'),
                'Stage 1 should never be locked'
            );
            console.assert(
                stage.querySelector('.stage-progress .progress-text').textContent === '100% Complete',
                'Progress text should show 100%'
            );
            
            // Test stage toggle
            const content = stage.querySelector('.stage-content');
            toggleStage(stage);
            console.assert(
                content.classList.contains('expanded'),
                'Stage content should be expanded after toggle'
            );
            
            // Cleanup
            document.body.removeChild(testContainer);
            console.groupEnd();
        }
    };
    
    // Run all tests
    Object.values(tests).forEach(test => test());
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        findLetterInAllCategories,
        displayLetterInTarget,
        runTests,
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

// Add getDrawingData function
function getDrawingData() {
    if (!canvasState.ctx || !canvasState.canvas) {
        console.error('Canvas context or element not available');
        return null;
    }
    
    try {
        return canvasState.ctx.getImageData(0, 0, canvasState.canvas.width, canvasState.canvas.height);
    } catch (error) {
        console.error('Error getting canvas image data:', error);
        return null;
    }
}

// Make it available globally
window.getDrawingData = getDrawingData; 

// Add these functions after the existing code

function showLearnedLetters() {
    const learntLettersWrite = window.Storage.getLearntLetters('write') || [];
    const learntLettersRead = window.Storage.getLearntLetters('read') || [];
    
    // Combine and deduplicate letters
    const allLetters = [...new Set([
        ...learntLettersWrite.map(l => typeof l === 'string' ? l : l.letter),
        ...learntLettersRead.map(l => typeof l === 'string' ? l : l.letter)
    ])];
    
    // Get details for each letter
    const letterDetails = allLetters.map(letter => {
        const writeInfo = learntLettersWrite.find(l => 
            (typeof l === 'string' && l === letter) || 
            (typeof l === 'object' && l.letter === letter)
        );
        const readInfo = learntLettersRead.find(l => 
            (typeof l === 'string' && l === letter) || 
            (typeof l === 'object' && l.letter === letter)
        );
        
        const letterObj = findLetterInAllCategories(letter);
        
        return {
            letter: letterObj?.letter || letter,
            transliteration: letterObj?.transliteration || '',
            lastReviewedWrite: writeInfo?.lastReviewed || null,
            lastReviewedRead: readInfo?.lastReviewed || null,
            learnedDateWrite: writeInfo?.learnedDate || null,
            learnedDateRead: readInfo?.learnedDate || null,
            writeAccuracy: window.Storage.getLetterCorrectness(letter, 'write'),
            readAccuracy: window.Storage.getLetterCorrectness(letter, 'read')
        };
    });
    
    // Sort by most recently reviewed
    letterDetails.sort((a, b) => {
        const lastA = Math.max(a.lastReviewedWrite || 0, a.lastReviewedRead || 0);
        const lastB = Math.max(b.lastReviewedWrite || 0, b.lastReviewedRead || 0);
        return lastB - lastA;
    });
    
    // Create the content
    const content = document.createElement('div');
    content.className = 'learned-letters-overlay';
    content.innerHTML = `
        <div class="learned-letters-content">
            <div class="learned-letters-header">
                <h2>Learned Letters</h2>
                <button class="close-overlay">
                    <span class="material-icons">close</span>
                </button>
            </div>
            <div class="letters-grid">
                ${letterDetails.map(info => {
                    const lastReviewedWrite = info.lastReviewedWrite ? 
                        new Date(info.lastReviewedWrite).toLocaleDateString() : 'Never';
                    const lastReviewedRead = info.lastReviewedRead ? 
                        new Date(info.lastReviewedRead).toLocaleDateString() : 'Never';
                    
                    return `
                        <div class="letter-card">
                            <div class="letter-header">
                                <span class="letter">${info.letter}</span>
                                <span class="transliteration">${info.transliteration}</span>
                            </div>
                            <div class="letter-stats">
                                <div class="stat-row">
                                    <span class="material-icons">edit</span>
                                    <div class="stat-details">
                                        <div>Last Write: ${lastReviewedWrite}</div>
                                        <div>Accuracy: ${info.writeAccuracy}%</div>
                                    </div>
                                </div>
                                <div class="stat-row">
                                    <span class="material-icons">visibility</span>
                                    <div class="stat-details">
                                        <div>Last Read: ${lastReviewedRead}</div>
                                        <div>Accuracy: ${info.readAccuracy}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    // Add close button handler
    const closeButton = content.querySelector('.close-overlay');
    closeButton.onclick = () => {
        document.body.removeChild(content);
    };
    
    // Add click outside to close
    content.onclick = (e) => {
        if (e.target === content) {
            document.body.removeChild(content);
        }
    };
    
    document.body.appendChild(content);
} 