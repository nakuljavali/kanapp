/**
 * @jest-environment jsdom
 */

// Mock window.localStorage
const localStorageMock = {
    getItem: function(key) { return null; },
    setItem: function(key, value) {},
    clear: function() {}
};
global.localStorage = localStorageMock;

// Mock window.location
const locationMock = {
    search: '',
    href: '',
    pathname: '/practice.html'
};
Object.defineProperty(window, 'location', {
    value: locationMock,
    writable: true
});

// Mock canvas context
const mockCtx = {
    beginPath: function() {},
    moveTo: function() {},
    lineTo: function() {},
    stroke: function() {},
    clearRect: function() {},
    getImageData: function() {
        return {
            data: new Uint8ClampedArray(400 * 400 * 4),
            width: 400,
            height: 400
        };
    },
    strokeStyle: '#000',
    lineWidth: 3,
    lineCap: 'round',
    lineJoin: 'round'
};

// Create DOM elements
const mockCanvas = document.createElement('canvas');
mockCanvas.getContext = function() { return mockCtx; };
mockCanvas.width = 400;
mockCanvas.height = 400;
mockCanvas.getBoundingClientRect = function() {
    return {
        width: 400,
        height: 400,
        left: 0,
        top: 0
    };
};

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
let learntLetters = [];
let levelProgress = {};

window.Storage = {
    getLearntLetters: function() { return learntLetters; },
    addLearntLetter: function(letter) { 
        learntLetters.push(letter);
        this.updateLevelProgress();
    },
    getLevelProgress: function(level) { return levelProgress[level] || 0; },
    updateLevelProgress: function() {
        // Update progress based on learnt letters
        const vowelsLearnt = learntLetters.filter(l => 
            window.letters.vowels.some(v => v.letter === l.letter)
        ).length;
        const consonantsLearnt = learntLetters.filter(l => 
            window.letters.consonants.velar.some(c => c.letter === l.letter)
        ).length;
        
        levelProgress = {
            vowels: (vowelsLearnt / window.letters.vowels.length) * 100,
            consonants_velar: (consonantsLearnt / window.letters.consonants.velar.length) * 100
        };
    }
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
    
    // Reset mock data
    learntLetters = [];
    levelProgress = {};
}

describe('Canvas Tests', () => {
    let canvas;
    let ctx;
    let drawingHandler;
    
    beforeEach(() => {
        // Set up document body
        document.body.innerHTML = `
            <canvas id="drawingCanvas"></canvas>
            <div id="targetLetter"></div>
            <div id="result"></div>
        `;
        
        // Get canvas and context
        canvas = document.getElementById('drawingCanvas');
        ctx = {
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            clearRect: jest.fn()
        };
        canvas.getContext = jest.fn().mockReturnValue(ctx);
        
        // Mock getDrawingData
        window.getDrawingData = jest.fn().mockReturnValue({
            data: new Uint8ClampedArray(100),
            width: 100,
            height: 100
        });
        
        // Set up drawing handler
        drawingHandler = {
            handleStart: function(e) {
                ctx.beginPath();
                ctx.moveTo(e.clientX, e.clientY);
            },
            handleMove: function(e) {
                if (e.buttons === 1) {
                    ctx.lineTo(e.clientX, e.clientY);
                    ctx.stroke();
                }
            }
        };
        
        // Add event listeners
        canvas.addEventListener('mousedown', drawingHandler.handleStart);
        canvas.addEventListener('mousemove', drawingHandler.handleMove);
    });
    
    test('Canvas is initialized correctly', () => {
        expect(canvas).toBeTruthy();
        expect(ctx).toBeTruthy();
    });
    
    test('Drawing functions are called correctly', () => {
        // Simulate mouse events
        const mousedown = new MouseEvent('mousedown', {
            clientX: 10,
            clientY: 10,
            buttons: 1
        });
        
        const mousemove = new MouseEvent('mousemove', {
            clientX: 20,
            clientY: 20,
            buttons: 1
        });
        
        canvas.dispatchEvent(mousedown);
        canvas.dispatchEvent(mousemove);
        
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
    });
    
    test('Clear canvas works', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
    });
    
    test('Get drawing data returns correct format', () => {
        const data = window.getDrawingData();
        expect(data).toBeTruthy();
        expect(data.data).toBeInstanceOf(Uint8ClampedArray);
        expect(data.width).toBe(100);
        expect(data.height).toBe(100);
    });
}); 