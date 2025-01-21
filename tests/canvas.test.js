// Mock canvas context
const mockCtx = {
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(400 * 400 * 4),
        width: 400,
        height: 400
    })),
    strokeStyle: '#000',
    lineWidth: 3,
    lineCap: 'round',
    lineJoin: 'round'
};

// Create DOM elements
const mockCanvas = document.createElement('canvas');
mockCanvas.getContext = jest.fn(() => mockCtx);
mockCanvas.width = 400;
mockCanvas.height = 400;
mockCanvas.getBoundingClientRect = jest.fn(() => ({
    width: 400,
    height: 400,
    left: 0,
    top: 0
}));

const mockTargetLetter = document.createElement('div');
const mockResultDiv = document.createElement('div');
const mockClearButton = document.createElement('button');
const mockSubmitButton = document.createElement('button');

// Mock window.letters
window.letters = {
    vowels: [
        {
            letter: "ಅ",
            pronunciation: "a",
            transliteration: "a",
            examples: ["ಅಮ್ಮ (amma - mother)"]
        }
    ],
    consonants: {
        velar: [
            {
                letter: "ಕ",
                pronunciation: "ka",
                transliteration: "ka",
                examples: ["ಕಮಲ (kamala - lotus)"]
            }
        ]
    }
};

// Mock window.Storage
window.Storage = {
    getLearntLetters: jest.fn().mockReturnValue([]),
    addLearntLetter: jest.fn(),
    getLevelProgress: jest.fn().mockReturnValue(0),
    updateLevelProgress: jest.fn()
};

function setupTestElements() {
    // Reset DOM elements
    document.body.innerHTML = '';
    mockCanvas.id = 'drawingCanvas';
    mockTargetLetter.id = 'targetLetter';
    mockResultDiv.id = 'result';
    mockClearButton.id = 'clearCanvas';
    mockSubmitButton.id = 'submitDrawing';
    
    // Add elements to DOM
    document.body.appendChild(mockCanvas);
    document.body.appendChild(mockTargetLetter);
    document.body.appendChild(mockResultDiv);
    document.body.appendChild(mockClearButton);
    document.body.appendChild(mockSubmitButton);
    
    // Reset canvas state
    window.canvasState = {
        isDrawing: false,
        canvas: mockCanvas,
        ctx: mockCtx,
        targetLetter: mockTargetLetter,
        resultDiv: mockResultDiv,
        clearButton: mockClearButton,
        submitButton: mockSubmitButton,
        currentLetter: null,
        lastX: 0,
        lastY: 0
    };
    
    // Reset mock functions
    Object.values(mockCtx).forEach(value => {
        if (typeof value === 'function') {
            value.mockClear();
        }
    });
    mockCanvas.getContext.mockClear();
    window.Storage.getLearntLetters.mockClear();
    window.Storage.addLearntLetter.mockClear();
}

describe('Canvas Tests', () => {
    let script;

    beforeEach(() => {
        jest.resetModules();

        // Reset window.letters with test data
        window.letters = {
            vowels: [{
                letter: 'ಅ',
                pronunciation: 'a',
                transliteration: 'a',
                examples: ['ಅಮ್ಮ (amma - mother)']
            }],
            consonants: {
                velar: [{
                    letter: 'ಕ',
                    pronunciation: 'ka',
                    transliteration: 'ka',
                    examples: ['ಕಮಲ (kamala - lotus)']
                }]
            }
        };

        // Reset window.Storage
        window.Storage = {
            getLearntLetters: jest.fn().mockReturnValue([]),
            addLearntLetter: jest.fn()
        };

        // Create DOM elements
        document.body.innerHTML = `
            <canvas id="drawingCanvas"></canvas>
            <div id="targetLetter"></div>
            <div id="result"></div>
            <button id="clearCanvas">Clear</button>
            <button id="submitDrawing">Submit</button>
        `;

        // Mock canvas context
        const mockCtx = {
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            clearRect: jest.fn(),
            getImageData: jest.fn().mockReturnValue({
                data: new Uint8ClampedArray(100).fill(255)
            })
        };

        // Mock canvas functions
        window.getDrawingData = jest.fn().mockReturnValue({
            data: new Uint8ClampedArray(100).fill(255)
        });
        window.calculateSimilarity = jest.fn().mockReturnValue(0.8);

        // Set up canvas state
        const canvas = document.getElementById('drawingCanvas');
        canvas.width = 400;
        canvas.height = 400;
        canvas.getContext = jest.fn().mockReturnValue(mockCtx);
        canvas.getBoundingClientRect = jest.fn().mockReturnValue({
            left: 0,
            top: 0,
            width: 400,
            height: 400
        });

        const targetLetter = document.getElementById('targetLetter');
        const resultDiv = document.getElementById('result');
        const clearButton = document.getElementById('clearCanvas');
        const submitButton = document.getElementById('submitDrawing');

        window.canvasState = {
            canvas,
            ctx: mockCtx,
            targetLetter,
            resultDiv,
            clearButton,
            submitButton,
            isDrawing: false,
            currentLetter: null
        };

        // Initialize canvas elements
        script = require('../script.js');
        script.initializeCanvasElements();
    });

    describe('Canvas Setup', () => {
        test('initializes canvas elements correctly', () => {
            expect(window.canvasState.canvas).toBeTruthy();
            expect(window.canvasState.ctx).toBeTruthy();
            expect(window.canvasState.targetLetter).toBeTruthy();
            expect(window.canvasState.resultDiv).toBeTruthy();
            expect(window.canvasState.clearButton).toBeTruthy();
            expect(window.canvasState.submitButton).toBeTruthy();
        });

        test('sets up canvas with correct dimensions', () => {
            expect(window.canvasState.canvas.width).toBe(400);
            expect(window.canvasState.canvas.height).toBe(400);
        });
    });

    describe('Letter Display', () => {
        test('setNewLetter handles consonant levels correctly', () => {
            // Set up URL for consonants_velar level
            Object.defineProperty(window, 'location', {
                value: {
                    search: '?level=consonants_velar',
                    href: 'http://localhost:3000/practice.html?level=consonants_velar'
                },
                writable: true
            });

            script.setNewLetter();
            
            const targetLetterHTML = window.canvasState.targetLetter.innerHTML.trim();
            expect(targetLetterHTML).toContain('ಕ');
            expect(targetLetterHTML).toContain('ka');
        });

        test('setNewLetter shows error for invalid level', () => {
            // Set up URL for invalid level
            Object.defineProperty(window, 'location', {
                value: {
                    search: '?level=invalid_level',
                    href: 'http://localhost:3000/practice.html?level=invalid_level'
                },
                writable: true
            });

            script.setNewLetter();
            
            const targetLetterHTML = window.canvasState.targetLetter.innerHTML.trim();
            expect(targetLetterHTML).toContain('Error: Invalid level');
        });
    });

    describe('Drawing Integration', () => {
        test('complete drawing workflow', () => {
            script.setNewLetter();
            
            // Simulate drawing
            const mouseEvent = {
                type: 'mousemove',
                clientX: 100,
                clientY: 100,
                preventDefault: jest.fn()
            };
            
            window.canvasState.isDrawing = true;
            script.draw(mouseEvent);
            window.canvasState.isDrawing = false;
            
            // Check drawing
            script.checkDrawing();
            
            // Verify feedback
            expect(window.canvasState.resultDiv.textContent).toContain('Great match');
        });

        test('clear canvas functionality', () => {
            script.clearCanvas();
            expect(window.canvasState.ctx.clearRect).toHaveBeenCalled();
        });
    });
}); 