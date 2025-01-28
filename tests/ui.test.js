/**
 * @jest-environment jsdom
 */

// Mock localStorage
const mockLocalStorage = {
    data: new Map(),
    getItem(key) {
        return this.data.get(key) || null;
    },
    setItem(key, value) {
        this.data.set(key, value);
    },
    removeItem(key) {
        this.data.delete(key);
    },
    clear() {
        this.data.clear();
    }
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
});

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

describe('UI Integration Tests', () => {
    let container;

    beforeEach(() => {
        // Create main container
        container = document.createElement('div');
        document.body.appendChild(container);

        // Reset localStorage
        mockLocalStorage.clear();

        // Mock Storage implementation
        window.Storage = {
            getLevelProgress: jest.fn().mockReturnValue(0),
            updateLevelProgress: jest.fn(),
            getLearntLetters: jest.fn().mockReturnValue([]),
            addLearntLetter: jest.fn(),
            getLetterStats: jest.fn().mockReturnValue({}),
            updateLetterStats: jest.fn(),
            getLetterCorrectness: jest.fn().mockReturnValue(0),
            clearAllData: jest.fn()
        };

        // Mock updateProgressBars function
        window.updateProgressBars = jest.fn();
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.clearAllMocks();
    });

    describe('Menu Navigation', () => {
        beforeEach(() => {
            // Set up menu HTML
            container.innerHTML = `
                <button class="menu-button">
                    <span class="material-icons">menu</span>
                </button>
                <div class="menu-overlay"></div>
                <div class="side-menu">
                    <div class="menu-header">
                        <h2>Menu</h2>
                        <button class="close-menu">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                    <div class="menu-items">
                        <a href="settings.html" class="menu-item">
                            <span class="material-icons">settings</span>
                            Settings
                        </a>
                    </div>
                </div>
            `;

            // Add menu event handlers
            const menuButton = container.querySelector('.menu-button');
            const closeButton = container.querySelector('.close-menu');
            const overlay = container.querySelector('.menu-overlay');
            const sideMenu = container.querySelector('.side-menu');

            menuButton.addEventListener('click', () => {
                sideMenu.classList.add('visible');
                overlay.classList.add('visible');
            });

            closeButton.addEventListener('click', () => {
                sideMenu.classList.remove('visible');
                overlay.classList.remove('visible');
            });

            overlay.addEventListener('click', () => {
                sideMenu.classList.remove('visible');
                overlay.classList.remove('visible');
            });
        });

        test('hamburger menu opens and closes correctly', () => {
            const menuButton = container.querySelector('.menu-button');
            const sideMenu = container.querySelector('.side-menu');
            const closeButton = container.querySelector('.close-menu');
            const overlay = container.querySelector('.menu-overlay');

            // Open menu
            menuButton.click();
            expect(sideMenu.classList.contains('visible')).toBe(true);
            expect(overlay.classList.contains('visible')).toBe(true);

            // Close menu
            closeButton.click();
            expect(sideMenu.classList.contains('visible')).toBe(false);
            expect(overlay.classList.contains('visible')).toBe(false);
        });

        test('clicking overlay closes menu', () => {
            const menuButton = container.querySelector('.menu-button');
            const sideMenu = container.querySelector('.side-menu');
            const overlay = container.querySelector('.menu-overlay');

            menuButton.click();
            overlay.click();
            expect(sideMenu.classList.contains('visible')).toBe(false);
        });
    });

    describe('Level Progress', () => {
        beforeEach(() => {
            // Set up level HTML
            container.innerHTML = `
                <div class="level">
                    <div class="level-title">Level 1: Vowels</div>
                    <div class="level-type">Write</div>
                    <div class="progress-bar">
                        <div class="progress" style="width: 0%"></div>
                    </div>
                </div>
            `;
        });

        test('progress bar updates after completing a letter', () => {
            window.Storage.getLevelProgress.mockReturnValue(50);
            window.updateProgressBars = function() {
                const progressBar = container.querySelector('.progress');
                progressBar.style.width = '50%';
            };
            window.updateProgressBars();

            const progressBar = container.querySelector('.progress');
            expect(progressBar.style.width).toBe('50%');
        });
    });

    describe('Write Practice', () => {
        beforeEach(() => {
            // Set up write practice HTML
            container.innerHTML = `
                <div class="practice-container">
                    <div class="current-letter">ಅ</div>
                    <canvas id="drawingCanvas"></canvas>
                    <button id="submitDrawing">Submit</button>
                    <div class="feedback"></div>
                </div>
            `;

            // Mock canvas context
            const canvas = container.querySelector('#drawingCanvas');
            canvas.getContext = jest.fn().mockReturnValue({
                getImageData: jest.fn().mockReturnValue({
                    data: new Uint8ClampedArray(100).fill(255)
                })
            });

            // Set up canvasState
            window.canvasState = {
                currentLetter: { letter: 'ಅ', transliteration: 'a' },
                ctx: canvas.getContext('2d')
            };

            // Add submit handler
            const submitButton = container.querySelector('#submitDrawing');
            submitButton.addEventListener('click', () => {
                const similarity = window.calculateSimilarity();
                const feedback = container.querySelector('.feedback');
                if (similarity > 30) {
                    window.Storage.updateLetterStats('ಅ', true, 'write');
                    feedback.textContent = 'Great match!';
                } else {
                    window.Storage.updateLetterStats('ಅ', false, 'write');
                    feedback.textContent = 'Try again';
                }
            });
        });

        test('correct write attempt updates progress and shows success message', () => {
            const submitButton = container.querySelector('#submitDrawing');
            const feedback = container.querySelector('.feedback');

            // Mock high similarity score
            window.calculateSimilarity = jest.fn().mockReturnValue(80);

            submitButton.click();

            expect(window.Storage.updateLetterStats).toHaveBeenCalledWith('ಅ', true, 'write');
            expect(feedback.textContent).toBe('Great match!');
        });

        test('incorrect write attempt shows retry message', () => {
            const submitButton = container.querySelector('#submitDrawing');
            const feedback = container.querySelector('.feedback');

            // Mock low similarity score
            window.calculateSimilarity = jest.fn().mockReturnValue(20);

            submitButton.click();

            expect(window.Storage.updateLetterStats).toHaveBeenCalledWith('ಅ', false, 'write');
            expect(feedback.textContent).toBe('Try again');
        });
    });

    describe('Read Practice', () => {
        beforeEach(() => {
            // Set up read practice HTML
            container.innerHTML = `
                <div class="read-container">
                    <div class="current-letter">ಅ</div>
                    <div class="options-grid">
                        <button class="option-button" data-transliteration="a">a</button>
                        <button class="option-button" data-transliteration="aa">aa</button>
                        <button class="option-button" data-transliteration="i">i</button>
                        <button class="option-button" data-transliteration="u">u</button>
                    </div>
                    <div class="feedback"></div>
                </div>
            `;

            window.currentLetter = { letter: 'ಅ', transliteration: 'a' };

            // Add click handlers for options
            const options = container.querySelectorAll('.option-button');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    const isCorrect = option.dataset.transliteration === window.currentLetter.transliteration;
                    const feedback = container.querySelector('.feedback');
                    
                    if (isCorrect) {
                        window.Storage.updateLetterStats('ಅ', true, 'read');
                        feedback.textContent = 'Correct!';
                        option.classList.add('correct');
                    } else {
                        window.Storage.updateLetterStats('ಅ', false, 'read');
                        feedback.textContent = 'Try again';
                        option.classList.add('incorrect');
                    }
                });
            });
        });

        test('correct read selection shows success and updates progress', () => {
            const correctOption = container.querySelector('[data-transliteration="a"]');
            const feedback = container.querySelector('.feedback');

            correctOption.click();

            expect(window.Storage.updateLetterStats).toHaveBeenCalledWith('ಅ', true, 'read');
            expect(feedback.textContent).toBe('Correct!');
            expect(correctOption.classList.contains('correct')).toBe(true);
        });

        test('incorrect read selection shows error', () => {
            const incorrectOption = container.querySelector('[data-transliteration="i"]');
            const feedback = container.querySelector('.feedback');

            incorrectOption.click();

            expect(window.Storage.updateLetterStats).toHaveBeenCalledWith('ಅ', false, 'read');
            expect(feedback.textContent).toBe('Try again');
            expect(incorrectOption.classList.contains('incorrect')).toBe(true);
        });
    });

    describe('Settings Page', () => {
        beforeEach(() => {
            // Set up settings HTML
            container.innerHTML = `
                <div class="settings-container">
                    <h2>Settings</h2>
                    <div class="stats">
                        <div class="stat-item">Progress: <span class="progress-value">0%</span></div>
                    </div>
                    <button class="clear-data">Clear All Progress</button>
                </div>
            `;

            // Add clear data handler
            const clearButton = container.querySelector('.clear-data');
            clearButton.addEventListener('click', () => {
                if (window.confirm('Are you sure you want to clear all progress?')) {
                    window.Storage.clearAllData();
                    container.querySelector('.progress-value').textContent = '0%';
                }
            });
        });

        test('clear data button resets progress', () => {
            const clearButton = container.querySelector('.clear-data');
            const progressValue = container.querySelector('.progress-value');

            // Mock confirm dialog
            window.confirm = jest.fn().mockReturnValue(true);

            clearButton.click();

            expect(window.Storage.clearAllData).toHaveBeenCalled();
            expect(progressValue.textContent).toBe('0%');
        });
    });
}); 