// Constants for storage keys
const STORAGE_KEYS = {
    LEARNT_LETTERS: 'learntLetters',
    LEARNT_LETTERS_READ: 'learntLettersRead',  // New key for read mode
    LETTER_STATS: 'letterStats',  // New key for tracking letter statistics
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
        
        // Check if the letter object is already in the array
        const letterExists = learntLetters.some(l => 
            (typeof l === 'string' && l === letter.letter) || 
            (typeof l === 'object' && l.letter === letter.letter)
        );
        
        if (!letterExists) {
            learntLetters.push(letter);
            localStorage.setItem(key, JSON.stringify(learntLetters));
            this.updateLevelProgress();
        }
    },

    // Get letter statistics
    getLetterStats: function() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.LETTER_STATS) || '{}');
    },

    // Update letter statistics
    updateLetterStats: function(letter, isCorrect, mode = 'write') {
        const stats = this.getLetterStats();
        if (!stats[letter]) {
            stats[letter] = {
                read: { correct: 0, total: 0 },
                write: { correct: 0, total: 0 }
            };
        }
        
        stats[letter][mode].total++;
        if (isCorrect) {
            stats[letter][mode].correct++;
        }
        
        localStorage.setItem(STORAGE_KEYS.LETTER_STATS, JSON.stringify(stats));
    },

    // Get correctness percentage for a letter
    getLetterCorrectness: function(letter, mode = 'write') {
        const stats = this.getLetterStats();
        if (!stats[letter] || !stats[letter][mode]) return 0;
        
        const { correct, total } = stats[letter][mode];
        return total === 0 ? 0 : Math.round((correct / total) * 100);
    },

    // Get letters for daily review
    getDailyReviewLetters: function() {
        const stats = this.getLetterStats();
        const learntLettersWrite = this.getLearntLetters('write');
        const learntLettersRead = this.getLearntLetters('read');
        
        // Combine learnt letters from both modes
        const allLearntLetters = [...new Set([
            ...learntLettersWrite.map(l => typeof l === 'string' ? l : l.letter),
            ...learntLettersRead.map(l => typeof l === 'string' ? l : l.letter)
        ])];
        
        if (allLearntLetters.length === 0) return [];
        
        // Calculate average correctness for each letter
        const letterScores = allLearntLetters.map(letter => {
            const writeCorrectness = this.getLetterCorrectness(letter, 'write');
            const readCorrectness = this.getLetterCorrectness(letter, 'read');
            const avgCorrectness = (writeCorrectness + readCorrectness) / 2;
            
            return {
                letter,
                correctness: avgCorrectness
            };
        });
        
        // Sort by correctness (lowest first) and take up to 20 letters
        return letterScores
            .sort((a, b) => a.correctness - b.correctness)
            .slice(0, Math.min(20, Math.max(5, letterScores.length)));
    },

    // Calculate and update progress for all levels
    updateLevelProgress: function() {
        if (!window.letters) {
            console.error('Letters data not loaded');
            return;
        }

        ['write', 'read'].forEach(mode => {
            const learntLetters = this.getLearntLetters(mode);
            const learntLetterSymbols = learntLetters.map(l => 
                typeof l === 'string' ? l : l.letter
            );
            
            // Calculate vowels progress
            const vowelsTotal = window.letters.vowels.length;
            const vowelsLearnt = learntLetterSymbols.filter(letter => 
                window.letters.vowels.some(v => v.letter === letter)
            ).length;
            const vowelsProgress = Math.round((vowelsLearnt / vowelsTotal) * 100);

            // Calculate progress for each consonant group
            Object.entries(window.letters.consonants).forEach(([group, letters]) => {
                const groupTotal = letters.length;
                const groupLearnt = learntLetterSymbols.filter(letter => 
                    letters.some(c => c.letter === letter)
                ).length;
                const groupProgress = Math.round((groupLearnt / groupTotal) * 100);

                // Store progress based on mode and group
                const progressKey = mode === 'write' ? 
                    STORAGE_KEYS.LEVEL_PROGRESS[`CONSONANTS_${group.toUpperCase()}_WRITE`] :
                    STORAGE_KEYS.LEVEL_PROGRESS[`CONSONANTS_${group.toUpperCase()}_READ`];
                
                localStorage.setItem(progressKey, groupProgress);
                console.log(`Progress for ${group} (${mode}):`, groupProgress);
            });

            // Store vowels progress
            const vowelsKey = mode === 'write' ? 
                STORAGE_KEYS.LEVEL_PROGRESS.VOWELS_WRITE : 
                STORAGE_KEYS.LEVEL_PROGRESS.VOWELS_READ;
            localStorage.setItem(vowelsKey, vowelsProgress);
            console.log(`Progress for vowels (${mode}):`, vowelsProgress);
        });
    },

    // Get progress for a specific level and mode
    getLevelProgress: function(levelType, mode) {
        // Handle vowels
        if (levelType === 'vowels') {
            const key = mode === 'read' ? 
                STORAGE_KEYS.LEVEL_PROGRESS.VOWELS_READ : 
                STORAGE_KEYS.LEVEL_PROGRESS.VOWELS_WRITE;
            return parseInt(localStorage.getItem(key) || '0');
        }
        
        // Handle consonant groups
        if (levelType.startsWith('consonants_')) {
            const group = levelType.split('_')[1].toUpperCase();
            const key = mode === 'read' ? 
                STORAGE_KEYS.LEVEL_PROGRESS[`CONSONANTS_${group}_READ`] :
                STORAGE_KEYS.LEVEL_PROGRESS[`CONSONANTS_${group}_WRITE`];
            return parseInt(localStorage.getItem(key) || '0');
        }
        
        return 0;
    },

    // Clear all stored data
    clearAllData: function() {
        localStorage.removeItem(STORAGE_KEYS.LEARNT_LETTERS);
        localStorage.removeItem(STORAGE_KEYS.LEARNT_LETTERS_READ);
        localStorage.removeItem(STORAGE_KEYS.LETTER_STATS);
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