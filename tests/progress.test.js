/**
 * @jest-environment jsdom
 */

// Mock Storage implementation
const mockStorage = {
    data: new Map(),
    setItem(key, value) {
        this.data.set(key, value);
    },
    getItem(key) {
        return this.data.get(key) || null;
    },
    removeItem(key) {
        this.data.delete(key);
    },
    clear() {
        this.data.clear();
    }
};

// Replace global localStorage
Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true
});

// Mock window.letters
window.letters = {
    vowels: [
        { letter: 'ಅ' },
        { letter: 'ಆ' },
        { letter: 'ಇ' }
    ],
    consonants: {
        velar: [
            { letter: 'ಕ' },
            { letter: 'ಖ' }
        ]
    }
};

describe('Progress Bar Tests', () => {
    let testContainer;

    beforeEach(() => {
        // Reset mockStorage
        mockStorage.clear();

        // Create test container and add to document
        testContainer = document.createElement('div');
        document.body.appendChild(testContainer);

        // Set up HTML structure for progress bars
        testContainer.innerHTML = `
            <div class="level">
                <div class="level-title">Level 1: Vowels</div>
                <div class="level-type">Write</div>
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
            </div>
            <div class="level">
                <div class="level-title">Level 5: Consonants (Palatal)</div>
                <div class="level-type">Write</div>
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
            </div>
        `;

        // Mock Storage functions
        window.Storage = {
            getLevelProgress: jest.fn().mockReturnValue(0),
            getLearntLetters: jest.fn().mockReturnValue([])
        };

        // Define updateProgressBars function
        window.updateProgressBars = function() {
            const levels = document.querySelectorAll('.level');
            levels.forEach(level => {
                const progressBar = level.querySelector('.progress');
                if (!progressBar) return;

                let levelId;
                const levelTitle = level.querySelector('.level-title');
                const levelType = level.querySelector('.level-type');
                const mode = levelType && levelType.textContent.toLowerCase().includes('read') ? 'read' : 'write';

                if (levelTitle) {
                    const title = levelTitle.textContent.toLowerCase();
                    if (title.includes('vowels')) {
                        levelId = 'vowels';
                    } else if (title.includes('consonants')) {
                        const match = title.match(/consonants\s*\((\w+)\)/i);
                        if (match) {
                            const group = match[1].toLowerCase();
                            levelId = `consonants_${group}`;
                        }
                    }
                }

                if (levelId) {
                    const progress = window.Storage.getLevelProgress(levelId, mode);
                    progressBar.style.width = `${progress}%`;

                    // Remove progress text if it exists
                    const progressText = level.querySelector('.progress-text');
                    if (progressText) {
                        progressText.remove();
                    }
                }
            });
        };
    });

    afterEach(() => {
        // Clean up
        document.body.removeChild(testContainer);
        jest.clearAllMocks();
        mockStorage.clear();
    });

    test('Progress bar updates correctly with different values', () => {
        window.Storage.getLevelProgress
            .mockReturnValueOnce(50)  // For vowels
            .mockReturnValueOnce(50); // For consonants
            
        window.updateProgressBars();
        
        const progressBars = testContainer.querySelectorAll('.progress');
        expect(progressBars[0].style.width).toBe('50%');
        expect(progressBars[1].style.width).toBe('50%');
    });

    test('Progress bars update correctly for multiple levels', () => {
        window.Storage.getLevelProgress
            .mockReturnValueOnce(60)  // For vowels
            .mockReturnValueOnce(40); // For consonants
            
        window.updateProgressBars();
        
        const progressBars = testContainer.querySelectorAll('.progress');
        expect(progressBars[0].style.width).toBe('60%');
        expect(progressBars[1].style.width).toBe('40%');
    });

    test('Progress text is removed after update', () => {
        const progressBars = testContainer.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            const progressText = document.createElement('div');
            progressText.className = 'progress-text';
            progressText.textContent = '0% Complete';
            bar.appendChild(progressText);
        });
        
        window.updateProgressBars();
        
        progressBars.forEach(bar => {
            expect(bar.querySelector('.progress-text')).toBeNull();
        });
    });

    test('updateProgressBars handles missing elements gracefully', () => {
        testContainer.innerHTML = '';
        expect(() => window.updateProgressBars()).not.toThrow();
    });

    test('updateProgressBars correctly identifies level IDs', () => {
        window.updateProgressBars();
        
        expect(window.Storage.getLevelProgress).toHaveBeenCalledWith('vowels', 'write');
        expect(window.Storage.getLevelProgress).toHaveBeenCalledWith('consonants_palatal', 'write');
    });

    test('updateProgressBars handles read mode correctly', () => {
        const levelType = testContainer.querySelector('.level-type');
        levelType.textContent = 'Read';
        
        window.updateProgressBars();
        
        expect(window.Storage.getLevelProgress).toHaveBeenCalledWith('vowels', 'read');
    });
});

describe('Progress Tracking Tests', () => {
    beforeEach(() => {
        localStorage.clear();
        
        // Mock window.letters
        window.letters = {
            vowels: [
                { letter: 'ಅ', transliteration: 'a' },
                { letter: 'ಆ', transliteration: 'aa' }
            ],
            consonants: {
                palatal: [
                    { letter: 'ಚ', transliteration: 'ca' },
                    { letter: 'ಛ', transliteration: 'cha' }
                ],
                retroflex: [
                    { letter: 'ಟ', transliteration: 'ta' },
                    { letter: 'ಠ', transliteration: 'tha' }
                ]
            }
        };

        // Create actual Storage implementation for these tests
        window.Storage = {
            getLevelProgress(levelId, mode = 'write') {
                if (!levelId) return 0;
                
                let key;
                if (levelId === 'vowels') {
                    key = mode === 'write' ? 'vowels_write' : 'vowels_read';
                } else if (levelId.startsWith('consonants_')) {
                    const group = levelId.replace('consonants_', '').toUpperCase();
                    key = `consonants_${group.toLowerCase()}_${mode}`;
                }
                
                return parseInt(localStorage.getItem(key) || '0', 10);
            },

            updateLevelProgress(levelId, mode, learntLetters) {
                if (!levelId || !mode || !learntLetters) return;

                const letters = this.getLevelLetters(levelId);
                if (!letters || letters.length === 0) return;

                const learntLetterSymbols = learntLetters.map(l => 
                    typeof l === 'string' ? l : l.letter
                );

                const learntCount = letters.filter(letter => 
                    learntLetterSymbols.includes(letter.letter)
                ).length;

                const progress = Math.round((learntCount / letters.length) * 100);

                let key;
                if (levelId === 'vowels') {
                    key = mode === 'write' ? 'vowels_write' : 'vowels_read';
                } else if (levelId.startsWith('consonants_')) {
                    const group = levelId.replace('consonants_', '').toUpperCase();
                    key = `consonants_${group.toLowerCase()}_${mode}`;
                }

                if (key) {
                    localStorage.setItem(key, progress.toString());
                }
            },

            getLevelLetters(levelId) {
                if (!window.letters) return [];

                if (levelId === 'vowels') {
                    return window.letters.vowels;
                }

                if (levelId.startsWith('consonants_')) {
                    const group = levelId.replace('consonants_', '');
                    return window.letters.consonants[group] || [];
                }

                return [];
            },

            clearAllData() {
                localStorage.clear();
            }
        };
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('updateLevelProgress correctly updates consonant group progress', () => {
        const learntLetters = [
            { letter: 'ಚ', lastReviewed: Date.now() }
        ];
        
        window.Storage.updateLevelProgress('consonants_palatal', 'write', learntLetters);
        const progress = window.Storage.getLevelProgress('consonants_palatal', 'write');
        
        expect(progress).toBe(50); // 1 out of 2 letters learned = 50%
    });

    test('getLevelProgress returns correct progress for consonant groups', () => {
        localStorage.setItem('consonants_palatal_write', '75');
        
        const progress = window.Storage.getLevelProgress('consonants_palatal', 'write');
        expect(progress).toBe(75);
    });

    test('updateLevelProgress handles multiple consonant groups independently', () => {
        const palatalLetters = [{ letter: 'ಚ', lastReviewed: Date.now() }];
        const retroflexLetters = [
            { letter: 'ಟ', lastReviewed: Date.now() },
            { letter: 'ಠ', lastReviewed: Date.now() }
        ];
        
        window.Storage.updateLevelProgress('consonants_palatal', 'write', palatalLetters);
        window.Storage.updateLevelProgress('consonants_retroflex', 'write', retroflexLetters);
        
        expect(window.Storage.getLevelProgress('consonants_palatal', 'write')).toBe(50);
        expect(window.Storage.getLevelProgress('consonants_retroflex', 'write')).toBe(100);
    });

    test('updateLevelProgress handles both read and write modes separately', () => {
        const letters = [{ letter: 'ಚ', lastReviewed: Date.now() }];
        
        window.Storage.updateLevelProgress('consonants_palatal', 'write', letters);
        window.Storage.updateLevelProgress('consonants_palatal', 'read', letters);
        
        expect(window.Storage.getLevelProgress('consonants_palatal', 'write')).toBe(50);
        expect(window.Storage.getLevelProgress('consonants_palatal', 'read')).toBe(50);
    });

    test('updateLevelProgress calculates progress correctly with no learned letters', () => {
        const emptyLetters = [];
        
        window.Storage.updateLevelProgress('consonants_palatal', 'write', emptyLetters);
        
        expect(window.Storage.getLevelProgress('consonants_palatal', 'write')).toBe(0);
    });

    test('updateLevelProgress calculates progress correctly with all letters learned', () => {
        const allPalatalLetters = [
            { letter: 'ಚ', lastReviewed: Date.now() },
            { letter: 'ಛ', lastReviewed: Date.now() }
        ];
        
        window.Storage.updateLevelProgress('consonants_palatal', 'write', allPalatalLetters);
        
        expect(window.Storage.getLevelProgress('consonants_palatal', 'write')).toBe(100);
    });

    test('getLevelProgress handles invalid level IDs gracefully', () => {
        expect(window.Storage.getLevelProgress('invalid_group', 'write')).toBe(0);
        expect(window.Storage.getLevelProgress('', 'write')).toBe(0);
        expect(window.Storage.getLevelProgress(null, 'write')).toBe(0);
    });

    test('updateLevelProgress handles invalid input gracefully', () => {
        const invalidCalls = [
            () => window.Storage.updateLevelProgress(null, 'write', []),
            () => window.Storage.updateLevelProgress('consonants_palatal', null, []),
            () => window.Storage.updateLevelProgress('consonants_palatal', 'write', null)
        ];
        
        invalidCalls.forEach(call => {
            expect(call).not.toThrow();
        });
    });

    test('clearAllData removes all progress data', () => {
        const letters = [{ letter: 'ಚ', lastReviewed: Date.now() }];
        window.Storage.updateLevelProgress('consonants_palatal', 'write', letters);
        window.Storage.updateLevelProgress('consonants_palatal', 'read', letters);
        
        window.Storage.clearAllData();
        
        expect(window.Storage.getLevelProgress('consonants_palatal', 'write')).toBe(0);
        expect(window.Storage.getLevelProgress('consonants_palatal', 'read')).toBe(0);
    });
});

describe('Storage Tests', () => {
    beforeEach(() => {
        localStorage.clear();
        
        // Mock window.letters
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

        // Create Storage implementation
        window.Storage = {
            getLearntLetters(mode = 'write') {
                const key = mode === 'read' ? 'learntLettersRead' : 'learntLetters';
                return JSON.parse(localStorage.getItem(key) || '[]');
            },

            addLearntLetter(letter, mode = 'write') {
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
                        learnedDate: learntLetters[existingIndex].learnedDate || Date.now(),
                        lastReviewed: Date.now()
                    };
                }
                
                localStorage.setItem(key, JSON.stringify(learntLetters));
            },

            getLetterStats() {
                return JSON.parse(localStorage.getItem('letterStats') || '{}');
            },

            updateLetterStats(letter, isCorrect, mode = 'write') {
                const stats = this.getLetterStats();
                if (!stats[letter]) {
                    stats[letter] = {
                        read: { correct: 0, total: 0, lastReviewed: null },
                        write: { correct: 0, total: 0, lastReviewed: null }
                    };
                }
                
                stats[letter][mode].total++;
                if (isCorrect) {
                    stats[letter][mode].correct++;
                    stats[letter][mode].lastReviewed = Date.now();
                }
                
                localStorage.setItem('letterStats', JSON.stringify(stats));
                
                // Update last reviewed time in learnt letters
                const learntLetters = this.getLearntLetters(mode);
                const updatedLetters = learntLetters.map(l => {
                    if ((typeof l === 'string' && l === letter) || 
                        (typeof l === 'object' && l.letter === letter)) {
                        return {
                            ...(typeof l === 'string' ? { letter: l } : l),
                            lastReviewed: Date.now()
                        };
                    }
                    return l;
                });
                
                const key = mode === 'read' ? 'learntLettersRead' : 'learntLetters';
                localStorage.setItem(key, JSON.stringify(updatedLetters));
            },

            getLetterCorrectness(letter, mode = 'write') {
                const stats = this.getLetterStats();
                if (!stats[letter] || !stats[letter][mode]) return 0;
                
                const { correct, total } = stats[letter][mode];
                return total === 0 ? 0 : Math.round((correct / total) * 100);
            },

            clearAllData() {
                localStorage.clear();
            }
        };
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('getLearntLetters returns empty array when no letters are learned', () => {
        expect(window.Storage.getLearntLetters('write')).toEqual([]);
        expect(window.Storage.getLearntLetters('read')).toEqual([]);
    });

    test('addLearntLetter adds new letter correctly', () => {
        const letter = { letter: 'ಅ', transliteration: 'a' };
        window.Storage.addLearntLetter(letter, 'write');
        
        const learntLetters = window.Storage.getLearntLetters('write');
        expect(learntLetters).toHaveLength(1);
        expect(learntLetters[0].letter).toBe('ಅ');
        expect(learntLetters[0].learnedDate).toBeDefined();
        expect(learntLetters[0].lastReviewed).toBeDefined();
    });

    test('addLearntLetter updates existing letter correctly', () => {
        const letter = { letter: 'ಅ', transliteration: 'a' };
        window.Storage.addLearntLetter(letter, 'write');
        
        // Add same letter again with updated time
        const updatedLetter = { ...letter };
        window.Storage.addLearntLetter(updatedLetter, 'write');
        
        const learntLetters = window.Storage.getLearntLetters('write');
        expect(learntLetters).toHaveLength(1);
        expect(learntLetters[0].lastReviewed).toBeDefined();
        expect(typeof learntLetters[0].lastReviewed).toBe('number');
        expect(learntLetters[0].lastReviewed).toBeGreaterThan(0);
    });

    test('updateLetterStats tracks statistics correctly', () => {
        const letter = 'ಅ';
        
        // Test correct attempt
        window.Storage.updateLetterStats(letter, true, 'write');
        let stats = window.Storage.getLetterStats();
        expect(stats[letter].write.correct).toBe(1);
        expect(stats[letter].write.total).toBe(1);
        
        // Test incorrect attempt
        window.Storage.updateLetterStats(letter, false, 'write');
        stats = window.Storage.getLetterStats();
        expect(stats[letter].write.correct).toBe(1);
        expect(stats[letter].write.total).toBe(2);
    });

    test('getLetterCorrectness calculates accuracy correctly', () => {
        const letter = 'ಅ';
        
        // Two correct attempts and one incorrect
        window.Storage.updateLetterStats(letter, true, 'write');
        window.Storage.updateLetterStats(letter, true, 'write');
        window.Storage.updateLetterStats(letter, false, 'write');
        
        const accuracy = window.Storage.getLetterCorrectness(letter, 'write');
        expect(accuracy).toBe(67); // 2/3 ≈ 67%
    });

    test('read and write modes are tracked separately', () => {
        const letter = 'ಅ';
        
        // Add letter in both modes
        window.Storage.addLearntLetter({ letter }, 'write');
        window.Storage.addLearntLetter({ letter }, 'read');
        
        // Update stats in both modes
        window.Storage.updateLetterStats(letter, true, 'write');
        window.Storage.updateLetterStats(letter, false, 'read');
        
        const writeLetters = window.Storage.getLearntLetters('write');
        const readLetters = window.Storage.getLearntLetters('read');
        const stats = window.Storage.getLetterStats();
        
        expect(writeLetters).toHaveLength(1);
        expect(readLetters).toHaveLength(1);
        expect(stats[letter].write.correct).toBe(1);
        expect(stats[letter].read.correct).toBe(0);
    });

    test('clearAllData removes all storage data', () => {
        // Add some data
        window.Storage.addLearntLetter({ letter: 'ಅ' }, 'write');
        window.Storage.updateLetterStats('ಅ', true, 'write');
        
        window.Storage.clearAllData();
        
        expect(window.Storage.getLearntLetters('write')).toEqual([]);
        expect(window.Storage.getLetterStats()).toEqual({});
        expect(window.Storage.getLetterCorrectness('ಅ', 'write')).toBe(0);
    });
}); 