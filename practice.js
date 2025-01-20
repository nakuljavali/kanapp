// Learning mode specific variables
let learntLetters = JSON.parse(localStorage.getItem('learntLetters') || '[]');
let lastPracticeDates = JSON.parse(localStorage.getItem('lastPracticeDates') || '{}');
const RETRY_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

import { initializeCanvas, clearCanvas, getTargetLetterData, getDrawingData } from './canvas.js';

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
        
        // Update learning progress
        updateLearningProgress(currentLetter, similarity);
        
        setTimeout(() => {
            setNewLetter();
            resultDiv.textContent = '';
        }, 1000);
    }
    
    resultDiv.textContent = message;
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
