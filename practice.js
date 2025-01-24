// Learning mode specific variables
let learntLetters = JSON.parse(localStorage.getItem('learntLetters') || '[]');
let lastPracticeDates = JSON.parse(localStorage.getItem('lastPracticeDates') || '{}');
const RETRY_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Initialize canvas functions
const { initializeCanvas, clearCanvas, getTargetLetterData, getDrawingData } = window;

function getNextLetter() {
    const mode = new URLSearchParams(window.location.search).get('mode');
    
    if (mode === 'learn') {
        // Filter out recently learned letters
        const now = Date.now();
        const availableLetters = kannadaLetters.filter(letter => {
            if (!learntLetters.includes(letter.letter)) return true;
            const lastPractice = lastPracticeDates[letter.letter] || 0;
            return (now - lastPractice) >= RETRY_INTERVAL;
        });

        if (availableLetters.length === 0) {
            // All letters learned recently
            return {
                letter: '✨',
                transliteration: 'Great job! All letters practiced today.',
                example: 'Come back tomorrow for review!',
                exampleTransliteration: ''
            };
        }

        return availableLetters[Math.floor(Math.random() * availableLetters.length)];
    } else {
        // Free mode - return random letter
        return kannadaLetters[Math.floor(Math.random() * kannadaLetters.length)];
    }
}

function updateLearningProgress(letter, similarity) {
    if (similarity >= 20) { // Success threshold
        window.Storage.addLearntLetter(letter, 'write');
    }
}

// Modify the checkDrawing function
function checkDrawing() {
    const drawingData = getDrawingData();
    const targetData = getTargetLetterData();
    
    if (!drawingData || !targetData) {
        console.error('Missing drawing or target data');
        return;
    }
    
    const similarity = calculateSimilarity(drawingData, targetData);
    console.log('Similarity score:', similarity);
    
    const isCorrect = similarity >= 50;  // Consider 50% similarity as correct
    
    // Update statistics
    window.Storage.updateLetterStats(canvasState.currentLetter.letter, isCorrect, 'write');
    
    if (isCorrect) {
        showFeedback('success', 'Great job! Your drawing matches the letter!');
        
        // Add to learnt letters only if not already learnt
        if (!window.Storage.getLearntLetters('write').some(l => 
            (typeof l === 'string' && l === canvasState.currentLetter.letter) || 
            (typeof l === 'object' && l.letter === canvasState.currentLetter.letter)
        )) {
            window.Storage.addLearntLetter(canvasState.currentLetter, 'write');
        }
        
        // Set new letter after delay
        setTimeout(() => {
            clearCanvas();
            setNewLetter();
        }, 1500);
    } else {
        showFeedback('error', 'Try again! Your drawing needs improvement.');
    }
}

function calculateMatchPercentage() {
    const drawnData = getDrawingData(); // Get drawn data
    const targetData = getTargetLetterData(currentLetter); // Get target letter data

    console.log('Drawn Data:', drawnData); // Log drawn data
    console.log('Target Data:', targetData); // Log target data

    let matchCount = 0;
    let totalCount = 0;

    for (let i = 0; i < drawnData.data.length; i += 4) {
        const drawnAlpha = drawnData.data[i + 3]; // Alpha channel
        if (drawnAlpha > 0) {
            totalCount++;
            // Compare RGB values
            if (
                drawnData.data[i] === targetData.data[i] &&
                drawnData.data[i + 1] === targetData.data[i + 1] &&
                drawnData.data[i + 2] === targetData.data[i + 2]
            ) {
                matchCount++;
            }
        }
    }

    console.log('Match Count:', matchCount); // Log match count
    console.log('Total Count:', totalCount); // Log total count

    return (matchCount / totalCount) * 100 || 0;
}

// Practice page functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Practice.js loaded');
    
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'learn';
    const level = urlParams.get('level') || 'vowels';

    console.log('Mode:', mode, 'Level:', level);

    const targetLetterElement = document.getElementById('targetLetter');
    const transliterationElement = document.getElementById('transliteration');
    const nextButton = document.getElementById('nextLetter');
    const hintButton = document.getElementById('showHint');
    const feedbackElement = document.getElementById('feedback');
    const submitButton = document.getElementById('submitDrawing');

    let currentLetter = null;

    function showNewLetter() {
        currentLetter = window.getRandomLetter(level);
        console.log('Current letter:', currentLetter);
        
        if (currentLetter) {
            targetLetterElement.textContent = currentLetter.letter || 'N/A';
            transliterationElement.innerHTML = `
                <div class="transliteration-text">${currentLetter.transliteration || 'N/A'}</div>
                <div class="pronunciation-text">${currentLetter.pronunciation || 'N/A'}</div>
            `;
            nextButton.style.display = 'none';
            feedbackElement.textContent = '';
            feedbackElement.className = 'feedback';
        } else {
            console.error('No letter found for level:', level);
            targetLetterElement.textContent = 'Error loading letter';
        }
    }

    function showHint() {
        const currentLetter = window.canvasState?.currentLetter;
        if (currentLetter) {
            const examples = currentLetter.examples || [];
            const examplesText = examples.length > 0 
                ? `Examples: ${examples.join(', ')}` 
                : 'No examples available';
            
            feedbackElement.innerHTML = `
                <div class="hint-content">
                    <div>Pronunciation: ${currentLetter.pronunciation || 'N/A'}</div>
                    <div>Transliteration: ${currentLetter.transliteration || 'N/A'}</div>
                    <div>${examplesText}</div>
                </div>
            `;
            feedbackElement.className = 'feedback hint';
        }
    }

    function handleSubmit() {
        const matchPercentage = window.calculateSimilarity(window.getDrawingData());
        alert(`Match Percentage: ${matchPercentage}%`);
    }

    // Event listeners
    if (nextButton) {
        nextButton.addEventListener('click', showNewLetter);
    }

    if (hintButton) {
        hintButton.addEventListener('click', showHint);
    }

    if (submitButton) {
        submitButton.addEventListener('click', handleSubmit);
    }

    showNewLetter();
});
