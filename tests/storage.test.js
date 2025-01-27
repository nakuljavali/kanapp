/**
 * @jest-environment jsdom
 */

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
});

// Mock window.letters for testing
window.letters = {
    vowels: [
        { letter: 'ಅ', transliteration: 'a' },
        { letter: 'ಆ', transliteration: 'aa' }
    ],
    consonants: {
        palatal: [
            { letter: 'ಚ', transliteration: 'ca' },
            { letter: 'ಛ', transliteration: 'cha' }
        ]
    }
};

// Create Storage implementation for testing
window.Storage = {
    getLevelProgress(levelId, mode = 'write') {
        try {
            if (!levelId) return 0;
            
            let key;
            if (levelId === 'vowels') {
                key = mode === 'write' ? 'vowels_write' : 'vowels_read';
            } else if (levelId.startsWith('consonants_')) {
                const group = levelId.replace('consonants_', '').toLowerCase();
                key = `consonants_${group}_${mode}`;
            }
            
            const value = localStorage.getItem(key);
            const progress = value ? parseInt(value, 10) : 0;
            return isNaN(progress) ? 0 : progress;
        } catch (e) {
            console.error('Error getting level progress:', e);
            return 0;
        }
    },

    updateLevelProgress(levelId, mode, progress) {
        try {
            if (!levelId || !mode) return;

            let key;
            if (levelId === 'vowels') {
                key = mode === 'write' ? 'vowels_write' : 'vowels_read';
            } else if (levelId.startsWith('consonants_')) {
                const group = levelId.replace('consonants_', '').toLowerCase();
                key = `consonants_${group}_${mode}`;
            }

            if (key) {
                localStorage.setItem(key, progress.toString());
            }
        } catch (e) {
            console.error('Error updating level progress:', e);
        }
    },

    getLearntLetters(mode = 'write') {
        try {
            const key = mode === 'read' ? 'learntLettersRead' : 'learntLetters';
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : [];
        } catch (e) {
            console.error('Error getting learnt letters:', e);
            return [];
        }
    },

    addLearntLetter(letter, mode = 'write') {
        try {
            const key = mode === 'read' ? 'learntLettersRead' : 'learntLetters';
            const learntLetters = this.getLearntLetters(mode);
            
            const letterObj = typeof letter === 'string' ? { letter } : letter;
            const existingIndex = learntLetters.findIndex(l => 
                (typeof l === 'string' && l === letterObj.letter) || 
                (typeof l === 'object' && l.letter === letterObj.letter)
            );
            
            if (existingIndex === -1) {
                learntLetters.push({
                    ...letterObj,
                    learnedDate: Date.now(),
                    lastReviewed: Date.now()
                });
            } else {
                learntLetters[existingIndex] = {
                    ...(typeof learntLetters[existingIndex] === 'string' 
                        ? { letter: learntLetters[existingIndex] } 
                        : learntLetters[existingIndex]),
                    ...letterObj,
                    lastReviewed: Date.now()
                };
            }
            
            localStorage.setItem(key, JSON.stringify(learntLetters));
        } catch (e) {
            console.error('Error adding learnt letter:', e);
        }
    }
};

describe('Storage Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Level Progress', () => {
        test('updateLevelProgress sets correct progress', () => {
            window.Storage.updateLevelProgress('vowels', 'write', 75);
            expect(localStorage.setItem).toHaveBeenCalledWith('vowels_write', '75');
        });

        test('getLevelProgress returns correct progress', () => {
            localStorage.getItem.mockReturnValue('50');
            expect(window.Storage.getLevelProgress('vowels', 'write')).toBe(50);
        });

        test('getLevelProgress handles invalid data', () => {
            localStorage.getItem.mockReturnValue('invalid');
            expect(window.Storage.getLevelProgress('vowels', 'write')).toBe(0);
        });
    });

    describe('Learnt Letters', () => {
        test('addLearntLetter adds letter correctly', () => {
            localStorage.getItem.mockReturnValue('[]');
            window.Storage.addLearntLetter('ಅ');
            expect(localStorage.setItem).toHaveBeenCalled();
            const setItemCall = localStorage.setItem.mock.calls[0];
            const savedData = JSON.parse(setItemCall[1]);
            expect(savedData[0].letter).toBe('ಅ');
            expect(savedData[0].learnedDate).toBeDefined();
            expect(savedData[0].lastReviewed).toBeDefined();
        });

        test('getLearntLetters returns correct letters', () => {
            const letters = [{ letter: 'ಅ', learnedDate: Date.now() }];
            localStorage.getItem.mockReturnValue(JSON.stringify(letters));
            expect(window.Storage.getLearntLetters()).toEqual(letters);
        });

        test('getLearntLetters handles invalid data', () => {
            localStorage.getItem.mockReturnValue('invalid json');
            expect(window.Storage.getLearntLetters()).toEqual([]);
        });
    });

    describe('Error Handling', () => {
        test('handles localStorage errors gracefully', () => {
            localStorage.getItem.mockImplementation(() => {
                throw new Error('localStorage error');
            });
            
            const progress = window.Storage.getLevelProgress('vowels', 'write');
            const letters = window.Storage.getLearntLetters();
            
            expect(progress).toBe(0);
            expect(letters).toEqual([]);
        });
    });
}); 