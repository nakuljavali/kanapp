// Mock window object properties
window.letters = {
    vowels: [
        { letter: 'ಅ', transliteration: 'a', pronunciation: 'a as in about', examples: 'ಅಮ್ಮ (amma) - mother' }
    ],
    consonants: {
        velar: [
            { letter: 'ಕ', transliteration: 'ka', pronunciation: 'ka as in call', examples: 'ಕಮಲ (kamala) - lotus' }
        ],
        palatal: [
            { letter: 'ಚ', transliteration: 'cha', pronunciation: 'cha as in chair', examples: 'ಚಂದ (chanda) - moon' }
        ]
    }
};

// Mock Storage object
window.Storage = {
    getLearntLetters: jest.fn(() => []),
    addLearntLetter: jest.fn(),
    getLevelProgress: jest.fn(() => 0)
};

// Mock URLSearchParams
window.URLSearchParams = jest.fn(() => ({
    get: jest.fn((param) => {
        switch (param) {
            case 'mode':
                return 'learn';
            case 'level':
                return 'vowels';
            default:
                return null;
        }
    })
}));

// Mock setTimeout
jest.useFakeTimers(); 