// State management
const readState = {
    currentLetter: null,
    options: [],
    canAnswer: true,
    initRetryCount: 0,
    isFirstAttempt: true  // Add this to track first attempts
};

function init() {
    // Get mode from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'review') {
        // Handle review mode
        const reviewLetters = JSON.parse(localStorage.getItem('reviewLetters') || '[]');
        if (reviewLetters.length > 0) {
            const currentLetter = reviewLetters[0];
            readState.currentLetter = currentLetter;
            displayLetterInTarget(currentLetter);
            
            // Remove the current letter from the review list
            reviewLetters.shift();
            localStorage.setItem('reviewLetters', JSON.stringify(reviewLetters));
            
            // Generate options
            generateOptions(currentLetter, window.letters.vowels.concat(window.letters.consonants));
        } else {
            // No more letters to review, go back to index
            window.location.href = 'index.html';
        }
    } else {
        setNewLetter();
    }
}

function setNewLetter() {
    // Clear any existing result message
    const resultMessage = document.querySelector('.result-message');
    if (resultMessage) {
        resultMessage.remove();
    }

    // Get level from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level') || 'vowels';
    const mode = urlParams.get('mode');
    
    let availableLetters = [];
    
    // Handle different level types
    if (level === 'vowels') {
        availableLetters = window.letters?.vowels || [];
    } else if (level.startsWith('consonants_')) {
        const consonantGroup = level.replace('consonants_', '');
        availableLetters = window.letters?.consonants?.[consonantGroup] || [];
    }
    
    if (!availableLetters || availableLetters.length === 0) {
        console.error('No letters available for level:', level);
        document.getElementById('targetLetter').innerHTML = '<div class="error">Error: Invalid level</div>';
        return;
    }
    
    // Get learnt letters
    const learntLetters = window.Storage?.getLearntLetters('read') || [];
    
    // Filter out learnt letters
    const unlearntLetters = availableLetters.filter(letter => 
        !learntLetters.some(learnt => learnt.letter === letter.letter)
    );
    
    if (unlearntLetters.length === 0) {
        if (mode === 'review') {
            document.getElementById('targetLetter').innerHTML = '<div class="completion">Daily Practice done!</div>';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            document.getElementById('targetLetter').innerHTML = 
                '<div class="completion">🎉 All letters learned! Try the next level!</div>';
        }
        return;
    }
    
    // Select a random unlearnt letter
    const randomIndex = Math.floor(Math.random() * unlearntLetters.length);
    readState.currentLetter = unlearntLetters[randomIndex];
    readState.isFirstAttempt = true;  // Reset first attempt flag
    
    // Generate options
    generateOptions(readState.currentLetter, availableLetters);
    
    // Display the letter
    displayLetterInTarget(readState.currentLetter);
}

function generateOptions(correctLetter, allLetters) {
    // Always include the correct answer
    const options = [correctLetter];
    
    // Get 3 random wrong answers
    const wrongOptions = allLetters
        .filter(letter => letter.letter !== correctLetter.letter)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    options.push(...wrongOptions);
    
    // Shuffle the options
    readState.options = options.sort(() => Math.random() - 0.5);
    
    // Display options
    displayOptions();
}

function displayLetterInTarget(letterObj) {
    const targetLetter = document.getElementById('targetLetter');
    if (!targetLetter || !letterObj) return;
    
    targetLetter.innerHTML = `
        <div class="letter">${letterObj.letter}</div>
    `;
}

function displayOptions() {
    const optionsGrid = document.querySelector('.options-grid');
    if (!optionsGrid) return;
    
    optionsGrid.innerHTML = readState.options.map(option => `
        <button class="option-button" data-letter="${option.letter}">
            <span class="transliteration">${option.transliteration}</span>
            ${option.pronunciation ? `<span class="pronunciation">${option.pronunciation}</span>` : ''}
        </button>
    `).join('');
    
    // Add click handlers
    const buttons = optionsGrid.querySelectorAll('.option-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => handleOptionClick(button));
    });
}

function handleOptionClick(button) {
    if (!readState.canAnswer) return;
    readState.canAnswer = false;
    
    const selectedLetter = button.dataset.letter;
    const selectedOption = readState.options.find(opt => opt.letter === selectedLetter);
    const isCorrect = selectedOption.transliteration === readState.currentLetter.transliteration;
    
    // Update statistics
    window.Storage.updateLetterStats(readState.currentLetter.letter, isCorrect, 'read');
    
    if (isCorrect) {
        button.classList.add('correct');
        document.getElementById('result').textContent = 'Correct! Well done!';
        document.getElementById('result').className = 'result-message success';
        
        // Add to learnt letters only on first correct attempt
        if (readState.isFirstAttempt) {
            window.Storage.addLearntLetter(readState.currentLetter, 'read');
        }
        
        // Set timeout to show next letter
        setTimeout(() => {
            setNewLetter();
            readState.canAnswer = true;
            readState.isFirstAttempt = true;
        }, 1500);
    } else {
        button.classList.add('incorrect');
        document.getElementById('result').textContent = 'Try again!';
        document.getElementById('result').className = 'result-message error';
        readState.isFirstAttempt = false;
        
        // Re-enable answering after a short delay
        setTimeout(() => {
            readState.canAnswer = true;
            button.classList.remove('incorrect');
            document.getElementById('result').textContent = '';
            document.getElementById('result').className = 'result-message';
        }, 1000);
    }
}

function checkAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (!selectedOption) {
        showFeedback('Please select an answer', false);
        return;
    }

    const resultContainer = document.querySelector('.result-message');
    if (resultContainer) {
        resultContainer.remove();
    }

    const isCorrect = selectedOption.value === readState.currentLetter.transliteration;
    const message = document.createElement('div');
    message.className = `result-message ${isCorrect ? 'success' : 'error'}`;
    message.textContent = isCorrect ? 'Correct! Well done!' : 'Try again!';
    document.querySelector('.multiple-choice-container').appendChild(message);

    // Update statistics
    window.Storage.updateLetterStats(readState.currentLetter.letter, isCorrect, 'read');

    if (isCorrect) {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'review') {
            // Get current review letters
            const reviewLetters = JSON.parse(localStorage.getItem('reviewLetters') || '[]');
            
            // Update last reviewed time
            const learntLetters = window.Storage.getLearntLetters('read');
            const updatedLetters = learntLetters.map(letter => {
                if (letter.letter === readState.currentLetter.letter) {
                    return { ...letter, lastReviewed: Date.now() };
                }
                return letter;
            });
            window.Storage.setLearntLetters(updatedLetters, 'read');
            
            // Remove the current letter from the review list
            const currentLetter = reviewLetters.shift();
            localStorage.setItem('reviewLetters', JSON.stringify(reviewLetters));
            
            // If no more letters to review, go back to index
            if (reviewLetters.length === 0) {
                localStorage.setItem('reviewLetters', '[]');
                showFeedback('Daily Practice done!', true);
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                return;
            }
        }

        // Set next letter after delay
        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const mode = urlParams.get('mode');
            
            if (mode === 'review') {
                const reviewLetters = JSON.parse(localStorage.getItem('reviewLetters') || '[]');
                if (reviewLetters.length > 0) {
                    const nextLetter = reviewLetters[0];
                    readState.currentLetter = nextLetter;
                    displayLetterInTarget(nextLetter);
                    
                    // Generate new options
                    generateOptions(nextLetter, window.letters.vowels.concat(window.letters.consonants));
                } else {
                    // No more letters to review, go back to index
                    showFeedback('Daily Practice done!', true);
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }
            } else {
                setNewLetter();
            }
        }, 1500);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 