/**
 * @jest-environment jsdom
 */

describe('Script Tests', () => {
    let script;
    let canvasState;
    let mockLocalStorage;

    beforeEach(() => {
        jest.useFakeTimers();
        
        // Mock localStorage
        mockLocalStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        };
        global.localStorage = mockLocalStorage;
        
        // Mock canvas context
        const mockContext = {
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            clearRect: jest.fn(),
            getImageData: jest.fn().mockReturnValue({
                data: new Uint8ClampedArray(400 * 400 * 4),
                width: 400,
                height: 400
            })
        };
        
        // Mock canvas element
        const mockCanvas = {
            getContext: jest.fn(() => mockContext),
            width: 400,
            height: 400,
            getBoundingClientRect: jest.fn(() => ({
                left: 0,
                top: 0,
                width: 400,
                height: 400
            })),
            addEventListener: jest.fn()
        };
        
        // Mock document methods
        document.querySelector = jest.fn((selector) => {
            if (selector === '#drawingCanvas') return mockCanvas;
            if (selector === '#result') return document.createElement('div');
            return null;
        });
        
        // Mock window methods
        global.setTimeout = jest.fn();
        
        // Set up document body
        document.body.innerHTML = `
            <canvas id="drawingCanvas"></canvas>
            <div id="targetLetter"></div>
            <div id="result"></div>
            <button id="clearCanvas">Clear</button>
            <button id="submitDrawing">Submit</button>
        `;

        // Import script
        script = require('../script.js');

        // Initialize canvas state
        script.initializeCanvasElements();
        canvasState = script.getState();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
        document.body.innerHTML = '';
    });

    describe('Canvas Initialization', () => {
        beforeEach(() => {
            // Set up document body with all required elements
            document.body.innerHTML = `
                <canvas id="drawingCanvas"></canvas>
                <div id="targetLetter"></div>
                <div id="result"></div>
                <button id="clearCanvas">Clear</button>
                <button id="submitDrawing">Submit</button>
            `;
            
            // Mock canvas context
            const mockContext = {
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                stroke: jest.fn(),
                clearRect: jest.fn(),
                getImageData: jest.fn().mockReturnValue({
                    data: new Uint8ClampedArray(400 * 400 * 4),
                    width: 400,
                    height: 400
                })
            };
            
            // Set up canvas
            const canvas = document.getElementById('drawingCanvas');
            canvas.getContext = jest.fn().mockReturnValue(mockContext);
            canvas.width = 400;
            canvas.height = 400;
            canvas.getBoundingClientRect = jest.fn().mockReturnValue({
                left: 0,
                top: 0,
                width: 400,
                height: 400
            });
            
            // Mock addEventListener
            canvas.addEventListener = jest.fn();
        });
        
        test('initializes canvas elements correctly', () => {
            script.initializeCanvasElements();
            const canvasState = script.getState();
            
            expect(canvasState.canvas).toBeTruthy();
            expect(canvasState.ctx).toBeTruthy();
            expect(canvasState.targetLetter).toBeTruthy();
            expect(canvasState.resultDiv).toBeTruthy();
            expect(canvasState.clearButton).toBeTruthy();
            expect(canvasState.submitButton).toBeTruthy();
        });
        
        test('sets up canvas correctly', () => {
            const result = script.setupCanvas();
            expect(result).toBe(true);
            
            const canvas = document.getElementById('drawingCanvas');
            expect(canvas.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
            expect(canvas.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(canvas.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
            expect(canvas.addEventListener).toHaveBeenCalledWith('mouseout', expect.any(Function));
        });
    });

    describe('Drawing Functions', () => {
        test('startDrawing sets isDrawing to true', () => {
            const event = new MouseEvent('mousedown', {
                clientX: 100,
                clientY: 100
            });
            script.startDrawing(event);
            expect(script.getState().isDrawing).toBe(true);
        });

        test('stopDrawing sets isDrawing to false', () => {
            script.setState({ isDrawing: true });
            script.stopDrawing();
            expect(script.getState().isDrawing).toBe(false);
        });

        test('draw function calls correct canvas methods', () => {
            script.setState({ isDrawing: true });
            const event = new MouseEvent('mousemove', {
                clientX: 100,
                clientY: 100
            });
            script.draw(event);
            expect(canvasState.ctx.lineTo).toHaveBeenCalled();
            expect(canvasState.ctx.stroke).toHaveBeenCalled();
        });

        test('clearCanvas clears the canvas', () => {
            script.clearCanvas();
            expect(canvasState.ctx.clearRect).toHaveBeenCalledWith(
                0, 0,
                canvasState.canvas.width,
                canvasState.canvas.height
            );
        });
    });

    describe('Letter Display', () => {
        beforeEach(() => {
            window.letters = {
                vowels: [{
                    letter: 'ಅ',
                    transliteration: 'a',
                    pronunciation: 'a as in about',
                    examples: ['ಅಮ್ಮ (amma) - mother']
                }],
                consonants: {
                    velar: [{
                        letter: 'ಕ',
                        transliteration: 'ka',
                        pronunciation: 'ka as in kite',
                        examples: ['ಕಮಲ (kamala) - lotus']
                    }]
                }
            };
        });

        test('findLetterInAllCategories finds vowel', () => {
            const letter = script.findLetterInAllCategories('ಅ');
            expect(letter).toBeTruthy();
            expect(letter.transliteration).toBe('a');
        });

        test('findLetterInAllCategories finds consonant', () => {
            const letter = script.findLetterInAllCategories('ಕ');
            expect(letter).toBeTruthy();
            expect(letter.transliteration).toBe('ka');
        });

        test('findLetterInAllCategories returns null for invalid letter', () => {
            const letter = script.findLetterInAllCategories('invalid');
            expect(letter).toBeNull();
        });

        test('displayLetterInTarget shows letter correctly', () => {
            const letterObj = {
                letter: 'ಅ',
                transliteration: 'a',
                pronunciation: 'a as in about',
                examples: ['ಅಮ್ಮ (amma) - mother']
            };
            script.displayLetterInTarget(letterObj);
            const targetHTML = canvasState.targetLetter.innerHTML;
            expect(targetHTML).toContain('ಅ');
            expect(targetHTML).toContain('a');
            expect(targetHTML).toContain('a as in about');
        });
    });

    describe('Drawing Data', () => {
        test('getDrawingData returns correct format', () => {
            const data = script.getDrawingData();
            expect(data).toBeTruthy();
            expect(data.width).toBe(400);
            expect(data.height).toBe(400);
            expect(data.data).toBeInstanceOf(Uint8ClampedArray);
        });

        test('getDrawingData handles missing canvas', () => {
            script.setState({ canvas: null });
            const data = script.getDrawingData();
            expect(data).toBeNull();
        });

        test('getDrawingData handles missing context', () => {
            script.setState({ ctx: null });
            const data = script.getDrawingData();
            expect(data).toBeNull();
        });
    });

    describe('Filter Functionality', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div class="filter-buttons">
                    <button class="filter-button" data-mode="all">All</button>
                    <button class="filter-button" data-mode="write">Write</button>
                    <button class="filter-button" data-mode="read">Read</button>
                </div>
                <div class="levels">
                    <div class="level">
                        <div class="level-type">Write</div>
                    </div>
                    <div class="level">
                        <div class="level-type">Read</div>
                    </div>
                </div>
            `;
        });

        test('initializeFilters sets up filter buttons correctly', () => {
            script.initializeFilters();
            const buttons = document.querySelectorAll('.filter-button');
            expect(buttons.length).toBe(3);
        });

        test('clicking filter button updates active state', () => {
            script.initializeFilters();
            const writeButton = document.querySelector('[data-mode="write"]');
            writeButton.click();
            expect(writeButton.classList.contains('active')).toBe(true);
        });

        test('filtering shows/hides correct levels', () => {
            script.initializeFilters();
            const writeButton = document.querySelector('[data-mode="write"]');
            writeButton.click();

            const levels = document.querySelectorAll('.level');
            expect(levels[0].classList.contains('hidden')).toBe(false);
            expect(levels[1].classList.contains('hidden')).toBe(true);
        });

        test('all filter shows all levels', () => {
            script.initializeFilters();
            const allButton = document.querySelector('[data-mode="all"]');
            allButton.click();

            const levels = document.querySelectorAll('.level');
            expect(levels[0].classList.contains('hidden')).toBe(false);
            expect(levels[1].classList.contains('hidden')).toBe(false);
        });
    });

    describe('Stage Management', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div class="stage" data-stage="1">
                    <div class="stage-header">
                        <h2>Stage 1</h2>
                        <div class="stage-progress">
                            <div class="progress-bar">
                                <div class="progress" style="width: 0%"></div>
                            </div>
                            <span class="progress-text">0% Complete</span>
                        </div>
                        <button class="toggle-stage">
                            <span class="material-icons">expand_more</span>
                        </button>
                    </div>
                    <div class="stage-content">
                        <div class="level">
                            <div class="progress-bar">
                                <div class="progress" style="width: 100%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="stage" data-stage="2">
                    <div class="stage-header">
                        <h2>Stage 2</h2>
                        <div class="stage-progress">
                            <div class="progress-bar">
                                <div class="progress" style="width: 0%"></div>
                            </div>
                            <span class="progress-text">0% Complete</span>
                        </div>
                        <button class="toggle-stage">
                            <span class="material-icons">expand_more</span>
                        </button>
                    </div>
                    <div class="stage-content">
                        <div class="level">
                            <div class="progress-bar">
                                <div class="progress" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        test('initializeStages sets up stages correctly', () => {
            script.initializeStages();
            const stages = document.querySelectorAll('.stage');
            expect(stages.length).toBe(2);
        });

        test('stage 1 is always unlocked', () => {
            script.initializeStages();
            const stage1 = document.querySelector('[data-stage="1"]');
            expect(stage1.classList.contains('locked')).toBe(false);
        });

        test('stage 2 is locked when stage 1 is incomplete', () => {
            script.initializeStages();
            const stage2 = document.querySelector('[data-stage="2"]');
            expect(stage2.classList.contains('locked')).toBe(true);
        });

        test('toggleStage expands and collapses content', () => {
            script.initializeStages();
            const stage = document.querySelector('[data-stage="1"]');
            const content = stage.querySelector('.stage-content');
            const header = stage.querySelector('.stage-header');

            header.click();
            expect(content.classList.contains('expanded')).toBe(true);

            header.click();
            expect(content.classList.contains('expanded')).toBe(false);
        });

        test('calculateStageProgress returns correct percentage', () => {
            const progress = script.calculateStageProgress(1);
            expect(progress).toBe(100);
        });

        test('updateStageState updates progress bar and text', () => {
            const stage = document.querySelector('[data-stage="1"]');
            script.updateStageState(stage);
            
            const progressBar = stage.querySelector('.progress');
            const progressText = stage.querySelector('.progress-text');
            
            expect(progressBar.style.width).toBe('100%');
            expect(progressText.textContent).toBe('100% Complete');
        });

        test('locked stage cannot be toggled', () => {
            script.initializeStages();
            const stage2 = document.querySelector('[data-stage="2"]');
            const content = stage2.querySelector('.stage-content');
            const header = stage2.querySelector('.stage-header');

            header.click();
            expect(content.classList.contains('expanded')).toBe(false);
        });
    });

    describe('Initialization', () => {
        let originalLocation;
        let originalLetters;
        let originalStorage;

        beforeEach(() => {
            originalLocation = window.location;
            originalLetters = window.letters;
            originalStorage = window.Storage;

            // Mock window.location
            delete window.location;
            window.location = {
                pathname: '/',
                search: '',
                href: 'http://localhost/'
            };

            // Mock letters
            window.letters = {
                vowels: [{
                    letter: 'ಅ',
                    transliteration: 'a'
                }],
                consonants: {
                    velar: [{
                        letter: 'ಕ',
                        transliteration: 'ka'
                    }]
                }
            };

            // Mock Storage
            window.Storage = {
                getLevelProgress: jest.fn().mockReturnValue(0),
                getLearntLetters: jest.fn().mockReturnValue([]),
                updateLevelProgress: jest.fn(),
                addLearntLetter: jest.fn()
            };
        });

        afterEach(() => {
            window.location = originalLocation;
            window.letters = originalLetters;
            window.Storage = originalStorage;
        });

        test('init retries when dependencies are not loaded', () => {
            window.letters = null;
            window.Storage = null;
            jest.useFakeTimers();

            script.init();
            expect(setTimeout).toHaveBeenCalledWith(script.init, 100);

            jest.runAllTimers();
        });

        test('init stops retrying after max attempts', () => {
            window.letters = null;
            window.Storage = null;
            script.setState({ initRetryCount: 50 });

            script.init();
            expect(script.getState().targetLetter.innerHTML).toContain('Error: Failed to load');
        });

        test('init initializes main page correctly', () => {
            window.location.pathname = '/index.html';
            const updateProgressBarsSpy = jest.spyOn(script, 'updateProgressBars');
            const initializeFiltersSpy = jest.spyOn(script, 'initializeFilters');
            const initializeStagesSpy = jest.spyOn(script, 'initializeStages');

            script.init();

            expect(updateProgressBarsSpy).toHaveBeenCalled();
            expect(initializeFiltersSpy).toHaveBeenCalled();
            expect(initializeStagesSpy).toHaveBeenCalled();
        });

        test('init initializes practice page correctly', () => {
            window.location.pathname = '/practice.html';
            window.location.search = '?mode=learn&level=vowels';
            const setupCanvasSpy = jest.spyOn(script, 'setupCanvas');
            const setNewLetterSpy = jest.spyOn(script, 'setNewLetter');

            script.init();

            expect(setupCanvasSpy).toHaveBeenCalled();
            expect(setNewLetterSpy).toHaveBeenCalled();
        });

        test('init handles free mode correctly', () => {
            window.location.pathname = '/practice.html';
            window.location.search = '?mode=free';
            localStorage.setItem('selectedLetter', 'ಅ');
            const displayLetterInTargetSpy = jest.spyOn(script, 'displayLetterInTarget');

            script.init();

            expect(displayLetterInTargetSpy).toHaveBeenCalledWith(expect.objectContaining({
                letter: 'ಅ'
            }));
        });

        test('init handles missing selected letter in free mode', () => {
            window.location.pathname = '/practice.html';
            window.location.search = '?mode=free';
            localStorage.removeItem('selectedLetter');
            const setNewLetterSpy = jest.spyOn(script, 'setNewLetter');

            script.init();

            expect(setNewLetterSpy).toHaveBeenCalled();
        });
    });

    describe('Similarity Calculation', () => {
        test('calculateSimilarity returns 0 for empty image data', () => {
            const emptyImageData = {
                data: new Uint8ClampedArray(400 * 400 * 4),
                width: 400,
                height: 400
            };
            expect(script.calculateSimilarity(emptyImageData)).toBe(0);
        });

        test('calculateSimilarity returns high score for black pixels', () => {
            const imageData = {
                data: new Uint8ClampedArray(400 * 400 * 4),
                width: 400,
                height: 400
            };
            
            // Fill with black pixels (R=0, G=0, B=0, A=255)
            for (let i = 0; i < imageData.data.length; i += 4) {
                imageData.data[i] = 0;     // R
                imageData.data[i + 1] = 0; // G
                imageData.data[i + 2] = 0; // B
                imageData.data[i + 3] = 255; // A
            }

            const score = script.calculateSimilarity(imageData);
            expect(score).toBeGreaterThan(50);
        });

        test('calculateSimilarity returns low score for white pixels', () => {
            const imageData = {
                data: new Uint8ClampedArray(400 * 400 * 4),
                width: 400,
                height: 400
            };
            
            // Fill with white pixels (R=255, G=255, B=255, A=255)
            for (let i = 0; i < imageData.data.length; i += 4) {
                imageData.data[i] = 255;     // R
                imageData.data[i + 1] = 255; // G
                imageData.data[i + 2] = 255; // B
                imageData.data[i + 3] = 255; // A
            }

            const score = script.calculateSimilarity(imageData);
            expect(score).toBeLessThan(50);
        });

        test('calculateSimilarity handles null input', () => {
            expect(script.calculateSimilarity(null)).toBe(0);
        });

        test('calculateSimilarity handles undefined input', () => {
            expect(script.calculateSimilarity(undefined)).toBe(0);
        });

        test('calculateSimilarity handles invalid image data', () => {
            const invalidImageData = {
                data: null,
                width: 400,
                height: 400
            };
            expect(script.calculateSimilarity(invalidImageData)).toBe(0);
        });

        test('calculateSimilarity handles mixed pixel colors', () => {
            const imageData = {
                data: new Uint8ClampedArray(400 * 400 * 4),
                width: 400,
                height: 400
            };
            
            // Fill with mixed pixels
            for (let i = 0; i < imageData.data.length; i += 8) {
                // Black pixel
                imageData.data[i] = 0;
                imageData.data[i + 1] = 0;
                imageData.data[i + 2] = 0;
                imageData.data[i + 3] = 255;
                
                // White pixel
                imageData.data[i + 4] = 255;
                imageData.data[i + 5] = 255;
                imageData.data[i + 6] = 255;
                imageData.data[i + 7] = 255;
            }

            const score = script.calculateSimilarity(imageData);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThan(100);
        });
    });

    describe('Feedback Display', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="result"></div>
            `;
            script.setState({
                resultDiv: document.getElementById('result')
            });
        });

        test('showFeedback displays success message correctly', () => {
            script.showFeedback('Great job!', true);
            const resultDiv = document.getElementById('result');
            
            expect(resultDiv.textContent).toBe('Great job!');
            expect(resultDiv.className).toContain('success');
            expect(resultDiv.style.display).toBe('block');
            expect(resultDiv.style.opacity).toBe('1');
        });

        test('showFeedback displays failure message correctly', () => {
            script.showFeedback('Try again', false);
            const resultDiv = document.getElementById('result');
            
            expect(resultDiv.textContent).toBe('Try again');
            expect(resultDiv.className).toContain('failure');
            expect(resultDiv.style.display).toBe('block');
            expect(resultDiv.style.opacity).toBe('1');
        });

        test('showFeedback handles missing result div', () => {
            script.setState({ resultDiv: null });
            expect(() => script.showFeedback('Test message', true)).not.toThrow();
        });

        test('showFeedback clears previous feedback timeout', () => {
            jest.useFakeTimers();
            
            script.showFeedback('First message', true);
            script.showFeedback('Second message', false);
            
            jest.runAllTimers();
            
            const resultDiv = document.getElementById('result');
            expect(resultDiv.textContent).toBe('Second message');
        });

        test('checkDrawing provides appropriate feedback based on similarity', () => {
            const mockImageData = {
                data: new Uint8ClampedArray(400 * 400 * 4),
                width: 400,
                height: 400
            };
            
            // Mock high similarity score
            jest.spyOn(script, 'calculateSimilarity').mockReturnValue(80);
            jest.spyOn(script, 'getDrawingData').mockReturnValue(mockImageData);
            
            script.checkDrawing();
            
            const resultDiv = document.getElementById('result');
            expect(resultDiv.textContent).toContain('Great match!');
            expect(resultDiv.className).toContain('success');
        });

        test('checkDrawing handles missing drawing data', () => {
            jest.spyOn(script, 'getDrawingData').mockReturnValue(null);
            
            script.checkDrawing();
            
            const resultDiv = document.getElementById('result');
            expect(resultDiv.textContent).toBe('Please draw something first!');
            expect(resultDiv.className).toContain('failure');
        });

        test('checkDrawing updates learning progress on success', () => {
            const mockImageData = {
                data: new Uint8ClampedArray(400 * 400 * 4),
                width: 400,
                height: 400
            };
            
            jest.spyOn(script, 'calculateSimilarity').mockReturnValue(80);
            jest.spyOn(script, 'getDrawingData').mockReturnValue(mockImageData);
            
            script.setState({
                currentLetter: { letter: 'ಅ' }
            });
            
            script.checkDrawing();
            
            expect(window.Storage.addLearntLetter).toHaveBeenCalledWith({ letter: 'ಅ' });
            expect(window.Storage.updateLevelProgress).toHaveBeenCalled();
        });

        test('checkDrawing provides feedback for close matches', () => {
            const mockImageData = {
                data: new Uint8ClampedArray(400 * 400 * 4),
                width: 400,
                height: 400
            };
            
            jest.spyOn(script, 'calculateSimilarity').mockReturnValue(20);
            jest.spyOn(script, 'getDrawingData').mockReturnValue(mockImageData);
            
            script.checkDrawing();
            
            const resultDiv = document.getElementById('result');
            expect(resultDiv.textContent).toContain('Close match');
            expect(resultDiv.className).toContain('failure');
        });
    });

    describe('Touch Event Handling', () => {
        beforeEach(() => {
            document.body.innerHTML = `<canvas id="drawingCanvas"></canvas>`;
            script.initializeCanvasElements();
            
            // Mock TouchEvent constructor
            global.TouchEvent = class TouchEvent {
                constructor(type, options = {}) {
                    this.type = type;
                    this.touches = options.touches || [];
                    this.preventDefault = jest.fn();
                }
            };
            
            // Mock Touch constructor
            global.Touch = class Touch {
                constructor(options = {}) {
                    this.clientX = options.clientX || 0;
                    this.clientY = options.clientY || 0;
                }
            };
        });
        
        test('handleTouch processes touchstart event correctly', () => {
            const touchEvent = new TouchEvent('touchstart', {
                touches: [new Touch({ clientX: 100, clientY: 100 })]
            });
            
            const canvas = document.getElementById('drawingCanvas');
            script.handleTouch(touchEvent);
            
            expect(document.body.classList.contains('drawing')).toBe(true);
            expect(script.getState().isDrawing).toBe(true);
            expect(script.getState().lastX).toBe(100);
            expect(script.getState().lastY).toBe(100);
        });
        
        test('handleTouch processes touchmove event correctly', () => {
            script.setState({ isDrawing: true });
            
            const touchEvent = new TouchEvent('touchmove', {
                touches: [new Touch({ clientX: 100, clientY: 100 })]
            });
            
            script.handleTouch(touchEvent);
            
            const ctx = script.getState().ctx;
            expect(ctx.lineTo).toHaveBeenCalled();
            expect(ctx.stroke).toHaveBeenCalled();
        });
        
        test('handleTouch processes touchend event correctly', () => {
            document.body.classList.add('drawing');
            script.setState({ isDrawing: true });
            
            const touchEvent = new TouchEvent('touchend');
            script.handleTouch(touchEvent);
            
            expect(document.body.classList.contains('drawing')).toBe(false);
            expect(script.getState().isDrawing).toBe(false);
        });
        
        test('handleTouch prevents default on touchmove', () => {
            const touchEvent = new TouchEvent('touchmove', {
                touches: [new Touch({ clientX: 100, clientY: 100 })]
            });
            
            script.handleTouch(touchEvent);
            expect(touchEvent.preventDefault).toHaveBeenCalled();
        });
        
        test('handleTouch handles missing touch coordinates', () => {
            const touchEvent = new TouchEvent('touchstart', { touches: [] });
            expect(() => script.handleTouch(touchEvent)).not.toThrow();
        });
        
        test('handleTouch updates last coordinates', () => {
            const touchEvent = new TouchEvent('touchstart', {
                touches: [new Touch({ clientX: 100, clientY: 100 })]
            });
            
            script.handleTouch(touchEvent);
            
            expect(script.getState().lastX).toBe(100);
            expect(script.getState().lastY).toBe(100);
        });
        
        test('handleTouch starts inactivity check on touch', () => {
            const touchEvent = new TouchEvent('touchstart', {
                touches: [new Touch({ clientX: 100, clientY: 100 })]
            });
            
            script.handleTouch(touchEvent);
            
            expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
        });
    });
}); 