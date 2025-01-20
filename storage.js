// Constants for storage keys
const STORAGE_KEYS = {
    LEARNT_LETTERS: 'learntLetters',
    LEARNT_LETTERS_READ: 'learntLettersRead',  // New key for read mode
    LEVEL_PROGRESS: {
        VOWELS_WRITE: 'vowels_write',
        VOWELS_READ: 'vowels_read',
        // Break down consonants into groups
        CONSONANTS_VELAR_WRITE: 'consonants_velar_write',
        CONSONANTS_VELAR_READ: 'consonants_velar_read',
        CONSONANTS_PALATAL_WRITE: 'consonants_palatal_write',
        CONSONANTS_PALATAL_READ: 'consonants_palatal_read',
        CONSONANTS_RETROFLEX_WRITE: 'consonants_retroflex_write',
        CONSONANTS_RETROFLEX_READ: 'consonants_retroflex_read',
        CONSONANTS_DENTAL_WRITE: 'consonants_dental_write',
        CONSONANTS_DENTAL_READ: 'consonants_dental_read',
        CONSONANTS_LABIAL_WRITE: 'consonants_labial_write',
        CONSONANTS_LABIAL_READ: 'consonants_labial_read',
        CONSONANTS_OTHER_WRITE: 'consonants_other_write',
        CONSONANTS_OTHER_READ: 'consonants_other_read'
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

        ['write', 'read'].forEach(mode => {
            const learntLetters = this.getLearntLetters(mode);
            
            // Calculate vowels progress
            const vowelsTotal = window.letters.vowels.length;
            const vowelsLearnt = learntLetters.filter(letter => 
                window.letters.vowels.some(v => v.letter === letter)
            ).length;
            const vowelsProgress = Math.round((vowelsLearnt / vowelsTotal) * 100);

            // Calculate progress for each consonant group
            const consonantGroups = [
                'velar', 'palatal', 'retroflex', 'dental', 'labial', 'other'
            ];

            consonantGroups.forEach(group => {
                const groupTotal = window.letters.consonants[group].length;
                const groupLearnt = learntLetters.filter(letter => 
                    window.letters.consonants[group].some(c => c.letter === letter)
                ).length;
                const groupProgress = Math.round((groupLearnt / groupTotal) * 100);

                // Store progress based on mode
                const progressKey = mode === 'write' ? 
                    STORAGE_KEYS.LEVEL_PROGRESS[`CONSONANTS_${group.toUpperCase()}_WRITE`] :
                    STORAGE_KEYS.LEVEL_PROGRESS[`CONSONANTS_${group.toUpperCase()}_READ`];
                
                localStorage.setItem(progressKey, groupProgress);
            });

            // Store vowels progress
            if (mode === 'write') {
                localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS.VOWELS_WRITE, vowelsProgress);
            } else {
                localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS.VOWELS_READ, vowelsProgress);
            }
        });
    },

    // Get progress for a specific level and mode
    getLevelProgress: function(levelType, mode) {
        const consonantGroups = ['velar', 'palatal', 'retroflex', 'dental', 'labial', 'other'];
        let progressKey;

        if (levelType === 'vowels') {
            progressKey = mode === 'read' ? 
                STORAGE_KEYS.LEVEL_PROGRESS.VOWELS_READ : 
                STORAGE_KEYS.LEVEL_PROGRESS.VOWELS_WRITE;
        } else {
            // Extract consonant group from levelType (e.g., "consonants_velar")
            const group = levelType.split('_')[1];
            if (consonantGroups.includes(group)) {
                progressKey = mode === 'read' ? 
                    STORAGE_KEYS.LEVEL_PROGRESS[`CONSONANTS_${group.toUpperCase()}_READ`] :
                    STORAGE_KEYS.LEVEL_PROGRESS[`CONSONANTS_${group.toUpperCase()}_WRITE`];
            }
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