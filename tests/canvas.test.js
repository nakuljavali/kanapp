// Mock canvas and context
const mockCtx = {
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    strokeStyle: null,
    lineWidth: null,
    lineCap: null,
    lineJoin: null
};

const mockCanvas = {
    getContext: jest.fn(() => mockCtx),
    width: 500,
    height: 300,
    getBoundingClientRect: jest.fn(() => ({
        width: 500,
        height: 300,
        left: 0,
        top: 0
    })),
    addEventListener: jest.fn(),
};

// Mock DOM elements
const mockElements = {
    canvas: mockCanvas,
    clearButton: { addEventListener: jest.fn() },
    submitButton: { addEventListener: jest.fn() },
    resultDiv: { textContent: '' },
    targetLetter: { innerHTML: '' }
};

// Import the functions to test
const script = require('../script.js');

// Mock letters data
const mockLetters = {
    vowels: [
        {
            letter: 'ಅ',
            transliteration: 'a',
            pronunciation: 'a as in about',
            examples: 'ಅಮ್ಮ (amma) - mother'
        }
    ],
    consonants: {
        velar: [
            {
                letter: 'ಕ',
                transliteration: 'ka',
                pronunciation: 'ka as in call',
                examples: 'ಕಮಲ (kamala) - lotus'
            }
        ]
    }
};

// Mock Storage object
window.Storage = {
    getLearntLetters: jest.fn().mockReturnValue([]),
    addLearntLetter: jest.fn()
};

// Mock window.letters
window.letters = { ...mockLetters };

describe('Canvas Setup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset mock functions
        Object.values(mockCtx).forEach(value => {
            if (typeof value === 'function') {
                value.mockClear();
            }
        });
        
        // Setup document.querySelector mock
        document.querySelector = jest.fn((selector) => {
            switch (selector) {
                case '#canvas':
                    return mockElements.canvas;
                case '#clearButton':
                    return mockElements.clearButton;
                case '#submitButton':
                    return mockElements.submitButton;
                case '#resultDiv':
                    return mockElements.resultDiv;
                case '#targetLetter':
                    return mockElements.targetLetter;
                default:
                    return null;
            }
        });
        
        // Initialize canvas elements
        script.initializeCanvasElements();
        
        // Set the initial state
        script.setState({
            canvas: mockCanvas,
            ctx: mockCtx,
            resultDiv: mockElements.resultDiv,
            targetLetter: mockElements.targetLetter,
            isDrawing: false
        });
    });

    test('setupCanvas initializes canvas with correct properties', () => {
        script.setupCanvas();
        
        // Check if canvas context was configured correctly
        expect(mockCtx.strokeStyle).toBe('#000');
        expect(mockCtx.lineWidth).toBe(3);
        expect(mockCtx.lineCap).toBe('round');
        expect(mockCtx.lineJoin).toBe('round');
        
        // Check if event listeners were added
        expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
        expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
        expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
        expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mouseout', expect.any(Function));
    });
});

describe('Drawing Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset mock functions
        Object.values(mockCtx).forEach(value => {
            if (typeof value === 'function') {
                value.mockClear();
            }
        });
        
        script.initializeCanvasElements();
        script.setState({
            canvas: mockCanvas,
            ctx: mockCtx,
            resultDiv: mockElements.resultDiv,
            targetLetter: mockElements.targetLetter,
            isDrawing: false
        });
    });

    test('startDrawing sets isDrawing to true', () => {
        const mockEvent = {
            type: 'mousedown',
            clientX: 100,
            clientY: 100,
            preventDefault: jest.fn()
        };
        
        script.startDrawing(mockEvent);
        expect(script.getState().isDrawing).toBe(true);
    });

    test('stopDrawing sets isDrawing to false', () => {
        script.setState({ isDrawing: true });
        script.stopDrawing();
        expect(script.getState().isDrawing).toBe(false);
        expect(mockCtx.beginPath).toHaveBeenCalled();
    });

    test('draw function draws line when isDrawing is true', () => {
        script.setState({ isDrawing: true });
        const mockEvent = {
            type: 'mousemove',
            clientX: 150,
            clientY: 150,
            preventDefault: jest.fn()
        };
        
        script.draw(mockEvent);
        
        expect(mockCtx.lineTo).toHaveBeenCalled();
        expect(mockCtx.stroke).toHaveBeenCalled();
        expect(mockCtx.beginPath).toHaveBeenCalled();
        expect(mockCtx.moveTo).toHaveBeenCalled();
    });

    test('draw function does nothing when isDrawing is false', () => {
        // Ensure isDrawing is false and clear all mock function calls
        script.setState({ isDrawing: false });
        Object.values(mockCtx).forEach(value => {
            if (typeof value === 'function') {
                value.mockClear();
            }
        });
        
        const mockEvent = {
            type: 'mousemove',
            clientX: 150,
            clientY: 150,
            preventDefault: jest.fn()
        };
        
        script.draw(mockEvent);
        
        expect(mockCtx.lineTo).not.toHaveBeenCalled();
        expect(mockCtx.stroke).not.toHaveBeenCalled();
    });
});

describe('Canvas Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        script.initializeCanvasElements();
        script.setState({
            canvas: mockCanvas,
            ctx: mockCtx,
            resultDiv: mockElements.resultDiv,
            targetLetter: mockElements.targetLetter
        });
    });

    test('clearCanvas clears the entire canvas', () => {
        script.clearCanvas();
        expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, mockCanvas.width, mockCanvas.height);
    });

    test('checkDrawing calculates similarity correctly', () => {
        const mockImageData = {
            data: new Uint8ClampedArray([
                255, 255, 255, 255, // White pixel with full alpha
                0, 0, 0, 0,         // Transparent pixel
                0, 0, 0, 255        // Black pixel with full alpha
            ]),
            width: 2,
            height: 2
        };
        
        mockCtx.getImageData.mockReturnValue(mockImageData);
        
        script.checkDrawing();
        
        expect(mockCtx.getImageData).toHaveBeenCalled();
        expect(mockElements.resultDiv.textContent).toBeTruthy();
    });
});

describe('Similarity Calculation', () => {
    test('calculateSimilarity returns 0 for empty canvas', () => {
        const emptyImageData = {
            data: new Uint8ClampedArray(100).fill(0),
            width: 5,
            height: 5
        };
        
        const similarity = script.calculateSimilarity(emptyImageData);
        expect(similarity).toBe(0);
    });

    test('calculateSimilarity returns non-zero for drawn canvas', () => {
        const drawnImageData = {
            data: new Uint8ClampedArray(100).fill(255),
            width: 5,
            height: 5
        };
        
        const similarity = script.calculateSimilarity(drawnImageData);
        expect(similarity).toBeGreaterThan(0);
    });
});

describe('Letter Display', () => {
    beforeEach(() => {
        // Reset letters data with consonants
        window.letters = {
            consonants: {
                velar: [{
                    letter: 'ಕ',
                    transliteration: 'ka',
                    pronunciation: 'ka as in call',
                    examples: 'ಕಮಲ (kamala) - lotus'
                }]
            },
            vowels: [{
                letter: 'ಅ',
                transliteration: 'a',
                pronunciation: 'a as in about',
                examples: 'ಅಮ್ಮ (amma) - mother'
            }]
        };

        // Mock URLSearchParams
        global.URLSearchParams = jest.fn((search) => ({
            get: (param) => {
                const params = new Map([
                    ['mode', 'learn'],
                    ['level', 'consonants_velar']
                ]);
                return params.get(param);
            }
        }));

        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: {
                search: '?mode=learn&level=consonants_velar',
                href: 'http://localhost/practice.html?mode=learn&level=consonants_velar'
            },
            writable: true
        });

        // Mock canvas and context
        const mockCanvas = {
            width: 500,
            height: 500,
            getContext: () => ({
                clearRect: jest.fn(),
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                stroke: jest.fn(),
                getImageData: jest.fn().mockReturnValue({
                    data: new Uint8ClampedArray(500 * 500 * 4)
                })
            })
        };

        // Mock target letter element
        const mockTargetLetter = document.createElement('div');
        const mockResultDiv = document.createElement('div');

        // Initialize canvas state
        script.setState({
            canvas: mockCanvas,
            ctx: mockCanvas.getContext('2d'),
            resultDiv: mockResultDiv,
            targetLetter: mockTargetLetter,
            currentLetter: null,
            isDrawing: false
        });

        // Mock Storage
        window.Storage = {
            getLearntLetters: jest.fn().mockReturnValue([]),
            addLearntLetter: jest.fn()
        };

        console.log('Test setup - window.letters:', JSON.stringify(window.letters, null, 2));
        console.log('Test setup - window.location.search:', window.location.search);
        console.log('Test setup - window.location.href:', window.location.href);
    });

    test('setNewLetter displays correct letter details in learn mode', () => {
        // Mock window.location for vowels
        Object.defineProperty(window, 'location', {
            value: {
                search: '?mode=learn&level=vowels',
                href: 'http://localhost/practice.html?mode=learn&level=vowels'
            },
            writable: true
        });

        // Mock URLSearchParams for vowels
        global.URLSearchParams = jest.fn((search) => ({
            get: (param) => {
                const params = new Map([
                    ['mode', 'learn'],
                    ['level', 'vowels']
                ]);
                return params.get(param);
            }
        }));

        script.setNewLetter();

        const targetLetterHTML = script.getState().targetLetter.innerHTML;
        expect(targetLetterHTML).toContain('ಅ'); // Letter
        expect(targetLetterHTML).toContain('a'); // Transliteration
        expect(targetLetterHTML).toContain('a as in about'); // Pronunciation
        expect(targetLetterHTML).toContain('ಅಮ್ಮ (amma) - mother'); // Example
    });

    test('setNewLetter handles consonant levels correctly', () => {
        script.setNewLetter();

        const targetLetterHTML = script.getState().targetLetter.innerHTML;
        expect(targetLetterHTML).toContain('ಕ');
        expect(targetLetterHTML).toContain('ka');
        expect(targetLetterHTML).toContain('ka as in call');
        expect(targetLetterHTML).toContain('ಕಮಲ (kamala) - lotus');
    });

    test('setNewLetter shows completion message when all letters are learned', () => {
        // Mock all letters as learned
        window.Storage.getLearntLetters.mockReturnValue(['ಕ']);

        script.setNewLetter();

        const targetLetterHTML = script.getState().targetLetter.innerHTML;
        expect(targetLetterHTML).toContain('Level Complete!');
        expect(targetLetterHTML).toContain('Great job!');
    });

    test('setNewLetter shows error for invalid level', () => {
        // Mock window.location for invalid level
        Object.defineProperty(window, 'location', {
            value: {
                search: '?mode=learn&level=invalid',
                href: 'http://localhost/practice.html?mode=learn&level=invalid'
            },
            writable: true
        });

        // Mock URLSearchParams for invalid level
        global.URLSearchParams = jest.fn((search) => ({
            get: (param) => {
                const params = new Map([
                    ['mode', 'learn'],
                    ['level', 'invalid']
                ]);
                return params.get(param);
            }
        }));

        script.setNewLetter();

        const targetLetterHTML = script.getState().targetLetter.innerHTML;
        expect(targetLetterHTML).toContain('Error: Invalid level');
        expect(targetLetterHTML).toContain('Please select a valid level');
    });
}); 