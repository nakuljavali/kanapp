// Constants for storage keys
const STORAGE_KEYS = {
    LEARNT_LETTERS: 'learntLetters',
    LEARNT_LETTERS_READ: 'learntLettersRead',  // New key for read mode
    LEVEL_PROGRESS: {
        VOWELS_WRITE: 'vowels_write',
        VOWELS_READ: 'vowels_read',
        CONSONANTS_WRITE: 'consonants_write',
        CONSONANTS_READ: 'consonants_read'  // Add read mode for consonants too
    }
};

// Storage utility functions
window.Storage = {
    // Get learnt letters based on mode
    getLearntLetters: function(mode = 'write') {
        const key = mode === 'read' ? STORAGE_KEYS.LEARNT_LETTERS_READ : STORAGE_KEYS.LEARNT_LETTERS;
        return JSON.parse(localStorage.getItem(key) || '[]');
    },

    // Add a learnt letter based on mode
    addLearntLetter: function(letter, mode = 'write') {
        const key = mode === 'read' ? STORAGE_KEYS.LEARNT_LETTERS_READ : STORAGE_KEYS.LEARNT_LETTERS;
        const learntLetters = this.getLearntLetters(mode);
        if (!learntLetters.includes(letter)) {
            learntLetters.push(letter);
            localStorage.setItem(key, JSON.stringify(learntLetters));
            this.updateLevelProgress();
        }
    },

    // Calculate and update progress for all levels
    updateLevelProgress: function() {
        if (!window.letters) {
            console.error('Letters data not loaded');
            return;
        }

        // Calculate progress for both modes
        ['write', 'read'].forEach(mode => {
            const learntLetters = this.getLearntLetters(mode);
            
            // Calculate vowels progress
            const vowelsTotal = window.letters.vowels.length;
            const vowelsLearnt = learntLetters.filter(letter => 
                window.letters.vowels.some(v => v.letter === letter)
            ).length;
            const vowelsProgress = Math.round((vowelsLearnt / vowelsTotal) * 100);

            // Calculate consonants progress
            const consonantsTotal = window.letters.consonants.length;
            const consonantsLearnt = learntLetters.filter(letter => 
                window.letters.consonants.some(c => c.letter === letter)
            ).length;
            const consonantsProgress = Math.round((consonantsLearnt / consonantsTotal) * 100);

            // Store progress based on mode
            if (mode === 'write') {
                localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS.VOWELS_WRITE, vowelsProgress);
                localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS.CONSONANTS_WRITE, consonantsProgress);
            } else {
                localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS.VOWELS_READ, vowelsProgress);
                localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS.CONSONANTS_READ, consonantsProgress);
            }

            console.log(`Progress updated for ${mode} mode:`, {
                vowels: vowelsProgress,
                consonants: consonantsProgress,
                learntLetters
            });
        });
    },

    // Get progress for a specific level and mode
    getLevelProgress: function(levelType, mode) {
        let progressKey;
        if (levelType === 'vowels') {
            progressKey = mode === 'read' ? 
                STORAGE_KEYS.LEVEL_PROGRESS.VOWELS_READ : 
                STORAGE_KEYS.LEVEL_PROGRESS.VOWELS_WRITE;
        } else if (levelType === 'consonants') {
            progressKey = mode === 'read' ? 
                STORAGE_KEYS.LEVEL_PROGRESS.CONSONANTS_READ : 
                STORAGE_KEYS.LEVEL_PROGRESS.CONSONANTS_WRITE;
        }

        return parseInt(localStorage.getItem(progressKey) || '0');
    },

    // Clear all stored data
    clearAllData: function() {
        localStorage.removeItem(STORAGE_KEYS.LEARNT_LETTERS);
        localStorage.removeItem(STORAGE_KEYS.LEARNT_LETTERS_READ);
        Object.values(STORAGE_KEYS.LEVEL_PROGRESS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};

// Initialize progress on load
document.addEventListener('DOMContentLoaded', () => {
    const initializeProgress = () => {
        if (window.letters) {
            window.Storage.updateLevelProgress();
        } else {
            setTimeout(initializeProgress, 100);
        }
    };
    initializeProgress();
});

// Debug log to verify storage is loaded
console.log('Storage functions initialized:', {
    learntLetters: {
        write: window.Storage.getLearntLetters('write'),
        read: window.Storage.getLearntLetters('read')
    }
}); 