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
    initRetryCount: 0
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

function setNewLetter() {
    console.log('Setting new letter...');
    
    // Get level from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level') || 'vowels';
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
            canvasState.targetLetter.innerHTML = '<div class="completion">🎉 All letters learned! Try the next level!</div>';
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
    if (!window.canvasState.canvas || !window.canvasState.resultDiv) {
        console.error('Canvas or result div not found');
        return;
    }

    const drawingData = window.getDrawingData();
    if (!drawingData) {
        window.canvasState.resultDiv.textContent = 'Please draw something first!';
        return;
    }

    const similarity = window.calculateSimilarity(drawingData);
    console.log('Similarity score:', similarity);

    if (similarity > 0.7) {
        window.canvasState.resultDiv.textContent = 'Great match! Well done!';
        // Add letter to learnt letters
        if (window.canvasState.currentLetter) {
            window.Storage.addLearntLetter(window.canvasState.currentLetter);
        }
        // Set new letter after a delay
        setTimeout(setNewLetter, 1500);
    } else if (similarity > 0.4) {
        window.canvasState.resultDiv.textContent = 'Close match - keep practicing!';
    } else {
        window.canvasState.resultDiv.textContent = 'Try again - keep practicing!';
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
        <div class="letter-content">
            <div class="letter">${letter}</div>
            <div class="transliteration">${transliteration}</div>
            ${pronunciation ? `<div class="pronunciation">${pronunciation}</div>` : ''}
            ${example ? `<div class="example">${example}</div>` : ''}
        </div>
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

// Initialize
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
    
    if (window.location.pathname.includes('practice.html')) {
        console.log('On practice page, initializing canvas...');
        if (!initializeCanvasElements()) {
            console.error('Failed to initialize canvas elements');
            return;
        }
        
        setupCanvas();
        
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const level = urlParams.get('level') || 'vowels';
        
        console.log('Mode:', mode, 'Level:', level);
        
        if (mode === 'free') {
            const selectedLetter = localStorage.getItem('selectedLetter');
            if (selectedLetter && selectedLetter.trim()) {
                // Try to get the letter object from localStorage first
                let letterObj;
                try {
                    const storedLetterData = localStorage.getItem('letterData');
                    if (storedLetterData) {
                        letterObj = JSON.parse(storedLetterData);
                        console.log('Found letter data in localStorage:', letterObj);
                    }
                } catch (e) {
                    console.error('Error parsing stored letter data:', e);
                }
                
                // If not in localStorage, search in window.letters
                if (!letterObj) {
                    letterObj = findLetterInAllCategories(selectedLetter);
                }
                
                // Fallback to basic letter object if still not found
                if (!letterObj) {
                    console.log('Creating basic letter object for:', selectedLetter);
                    letterObj = {
                        letter: selectedLetter,
                        transliteration: selectedLetter,
                        pronunciation: selectedLetter,
                        examples: []
                    };
                }
                
                console.log('Setting current letter:', letterObj);
                canvasState.currentLetter = letterObj;
                displayLetterInTarget(letterObj);
            } else {
                console.log('No selected letter, setting new letter');
                setNewLetter();
            }
        } else {
            console.log('Setting new letter for level:', level);
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