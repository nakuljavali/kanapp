// State management
const readState = {
    currentLetter: null,
    options: [],
    canAnswer: true,
    initRetryCount: 0,
    isFirstAttempt: true  // Add this to track first attempts
};

function init() {
    console.log('Initializing read mode...');
    
    if (!window.letters || !window.Storage) {
        if (readState.initRetryCount >= 50) {
            console.error('Failed to load dependencies after 50 retries');
            return;
        }
        console.error('Required dependencies not loaded. Retrying in 100ms...');
        readState.initRetryCount++;
        setTimeout(init, 100);
        return;
    }
    
    setNewLetter();
}

function setNewLetter() {
    // Get level from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level') || 'vowels';
    
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
        document.getElementById('targetLetter').innerHTML = 
            '<div class="completion">🎉 All letters learned! Try the next level!</div>';
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
        button.addEventListener('click', handleOptionClick);
    });
}

function handleOptionClick(event) {
    if (!readState.canAnswer) return;
    
    const selectedLetter = event.currentTarget.dataset.letter;
    const isCorrect = selectedLetter === readState.currentLetter.letter;
    
    // Show result
    const resultDiv = document.getElementById('result');
    if (isCorrect) {
        event.currentTarget.classList.add('correct');
        
        if (readState.isFirstAttempt) {
            // Only mark as learned and update progress if it's the first attempt
            window.Storage.addLearntLetter(readState.currentLetter, 'read');
            
            // Update progress
            const urlParams = new URLSearchParams(window.location.search);
            const level = urlParams.get('level') || 'vowels';
            window.Storage.updateLevelProgress(level, 'read');
            
            resultDiv.innerHTML = 'Correct on first try! Well done! 🎉';
        } else {
            resultDiv.innerHTML = 'Correct! Keep practicing! 👍';
        }
        resultDiv.className = 'result-message success';
        
        // Disable further answers
        readState.canAnswer = false;
        
        // Set next letter after delay
        setTimeout(() => {
            readState.canAnswer = true;
            setNewLetter();
            resultDiv.innerHTML = '';
            resultDiv.className = 'result-message';
        }, 1500);
    } else {
        event.currentTarget.classList.add('incorrect');
        resultDiv.innerHTML = 'Try again!';
        resultDiv.className = 'result-message error';
        readState.isFirstAttempt = false;  // Mark as not first attempt after first mistake
        
        // Enable answering again immediately
        setTimeout(() => {
            event.currentTarget.classList.remove('incorrect');
            resultDiv.innerHTML = '';
            resultDiv.className = 'result-message';
        }, 500);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 