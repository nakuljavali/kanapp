let currentLetter = null;
let currentLevel = '';

document.addEventListener('DOMContentLoaded', () => {
    // Get level from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentLevel = urlParams.get('level') || 'vowels';
    
    // Initialize event listeners
    document.getElementById('submitAnswer').addEventListener('click', checkAnswer);
    document.getElementById('showHint').addEventListener('click', showHint);
    document.getElementById('nextLetter').addEventListener('click', setNewLetter);
    document.getElementById('answerInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // Set first letter
    setNewLetter();
});

function setNewLetter() {
    const targetLetter = document.getElementById('targetLetter');
    const answerInput = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    const nextButton = document.getElementById('nextLetter');
    
    // Reset UI
    answerInput.value = '';
    feedback.innerHTML = '';
    feedback.className = 'feedback';
    nextButton.style.display = 'none';
    answerInput.disabled = false;
    answerInput.focus();
    
    // Get available letters for current level
    let availableLetters = kannadaLetters[currentLevel];
    
    // Select random letter
    currentLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    
    // Display letter
    targetLetter.textContent = currentLetter.letter;
}

function checkAnswer() {
    const answerInput = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    const nextButton = document.getElementById('nextLetter');
    const answer = answerInput.value.trim().toLowerCase();
    
    if (answer === currentLetter.transliteration.toLowerCase()) {
        feedback.innerHTML = `
            <div class="correct">Correct! 🎉</div>
            <div class="example">Example: ${currentLetter.example}</div>
            <div class="example-transliteration">Meaning: ${currentLetter.exampleTransliteration}</div>
        `;
        feedback.className = 'feedback correct';
        answerInput.disabled = true;
        nextButton.style.display = 'flex';
        
        // Store progress
        const learntLetters = JSON.parse(localStorage.getItem('readLearntLetters') || '[]');
        if (!learntLetters.includes(currentLetter.letter)) {
            learntLetters.push(currentLetter.letter);
            localStorage.setItem('readLearntLetters', JSON.stringify(learntLetters));
        }
    } else {
        feedback.textContent = 'Try again! That\'s not how you read this letter.';
        feedback.className = 'feedback incorrect';
    }
}

function showHint() {
    const feedback = document.getElementById('feedback');
    const transliteration = currentLetter.transliteration;
    feedback.textContent = `Hint: This letter is read as something that starts with "${transliteration[0]}"`;
    feedback.className = 'feedback';
} 