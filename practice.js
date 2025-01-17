const kannadaLetters = [
    'ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 
    'ಋ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ'
];

// Learning mode specific variables
let learntLetters = JSON.parse(localStorage.getItem('learntLetters') || '[]');
let lastPracticeDates = JSON.parse(localStorage.getItem('lastPracticeDates') || '{}');
const RETRY_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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
        learntLetters = [...new Set([...learntLetters, letter])];
        lastPracticeDates[letter] = Date.now();
        
        localStorage.setItem('learntLetters', JSON.stringify(learntLetters));
        localStorage.setItem('lastPracticeDates', JSON.stringify(lastPracticeDates));
    }
}

// Modify the checkDrawing function
function checkDrawing() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const similarity = calculateSimilarity(imageData);
    
    let message;
    if (similarity < 5) {
        message = `Try again! (Debug: ${similarity}% match)`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else if (similarity >= 5 && similarity < 20) {
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
        }, 2000);
    }
    
    resultDiv.textContent = message;
}

// Rest of the existing canvas and drawing functions...
