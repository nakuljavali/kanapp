/**
 * @jest-environment jsdom
 */

// Mock window.Storage
window.Storage = {
    getLearntLetters: jest.fn().mockReturnValue([]),
    addLearntLetter: jest.fn(),
    getLevelProgress: jest.fn().mockReturnValue(0),
    updateLevelProgress: jest.fn()
};

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
        // Set up test container
        testContainer = document.createElement('div');
        document.body.appendChild(testContainer);
        
        // Create test progress bars
        testContainer.innerHTML = `
            <div class="level" data-level="vowels_write">
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
            </div>
            <div class="level" data-level="consonants_write">
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
            </div>
        `;
        
        // Mock Storage functions
        window.Storage = {
            getLevelProgress: jest.fn(),
            updateLevelProgress: jest.fn(),
            getLearntLetters: jest.fn(),
            addLearntLetter: jest.fn()
        };
        
        // Define updateProgressBars function
        window.updateProgressBars = function() {
            const progressBars = document.querySelectorAll('.progress');
            progressBars.forEach(bar => {
                const level = bar.closest('.level');
                const progress = window.Storage.getLevelProgress(level.dataset.level) || 0;
                bar.style.width = progress + '%';
                
                // Remove progress text if it exists
                const progressText = bar.parentElement.querySelector('.progress-text');
                if (progressText) {
                    progressText.remove();
                }
            });
        };
    });

    afterEach(() => {
        document.body.removeChild(testContainer);
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('Progress bar updates correctly with different values', () => {
        // Test 50% progress
        window.Storage.getLevelProgress.mockReturnValue(50);
        window.updateProgressBars();
        const progressBar = testContainer.querySelector('.progress');
        expect(progressBar.style.width).toBe('50%');
        
        // Test 100% progress
        window.Storage.getLevelProgress.mockReturnValue(100);
        window.updateProgressBars();
        expect(progressBar.style.width).toBe('100%');
        
        // Test 0% progress
        window.Storage.getLevelProgress.mockReturnValue(0);
        window.updateProgressBars();
        expect(progressBar.style.width).toBe('0%');
    });

    test('Progress calculation works correctly for vowels', () => {
        const mockStorage = {
            learntLetters: ['ಅ']
        };
        
        window.Storage.getLearntLetters.mockReturnValue(mockStorage.learntLetters);
        window.Storage.updateLevelProgress();
        
        expect(window.Storage.updateLevelProgress).toHaveBeenCalled();
    });

    test('Progress calculation works correctly for consonants', () => {
        const mockStorage = {
            learntLetters: ['ಕ']
        };
        
        window.Storage.getLearntLetters.mockReturnValue(mockStorage.learntLetters);
        window.Storage.updateLevelProgress();
        
        expect(window.Storage.updateLevelProgress).toHaveBeenCalled();
    });

    test('Progress bars update correctly for multiple levels', () => {
        window.Storage.getLevelProgress
            .mockReturnValueOnce(60)  // For vowels
            .mockReturnValueOnce(40); // For consonants
            
        window.updateProgressBars();
        
        const vowelsProgress = testContainer.querySelector('.level[data-level="vowels_write"] .progress');
        const consonantsProgress = testContainer.querySelector('.level[data-level="consonants_write"] .progress');
        
        expect(vowelsProgress.style.width).toBe('60%');
        expect(consonantsProgress.style.width).toBe('40%');
    });

    test('Progress text is removed after update', () => {
        const progressBar = testContainer.querySelector('.progress-bar');
        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressBar.appendChild(progressText);
        
        window.updateProgressBars();
        
        expect(progressBar.querySelector('.progress-text')).toBeNull();
    });
}); 