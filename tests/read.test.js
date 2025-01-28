/**
 * @jest-environment jsdom
 */

const Storage = require('../storage.js');

describe('Read Mode Tests', () => {
    let testContainer;
    let mockStorage;

    beforeEach(() => {
        testContainer = document.createElement('div');
        testContainer.innerHTML = `
            <div class="read-practice">
                <div class="letter-display">
                    <div class="letter">ಅ</div>
                    <div class="transliteration">a</div>
                    <div class="pronunciation">a as in about</div>
                    <div class="example">ಅಮ್ಮ (amma) - mother</div>
                </div>
                <div class="answer-section">
                    <input type="text" id="answer" placeholder="Type the transliteration">
                    <button id="submitAnswer">Submit</button>
                    <div id="result"></div>
                </div>
            </div>
        `;
        document.body.appendChild(testContainer);

        // Mock Storage
        mockStorage = {
            getLevelProgress: jest.fn().mockReturnValue(0),
            getLearntLetters: jest.fn().mockReturnValue([]),
            updateLevelProgress: jest.fn(),
            addLearntLetter: jest.fn()
        };
        window.Storage = mockStorage;

        // Mock letters
        window.letters = {
            vowels: [
                {
                    letter: 'ಅ',
                    transliteration: 'a',
                    pronunciation: 'a as in about',
                    examples: ['ಅಮ್ಮ (amma) - mother']
                }
            ],
            consonants: [
                {
                    letter: 'ಕ',
                    transliteration: 'ka',
                    pronunciation: 'ka as in kite',
                    examples: ['ಕಮಲ (kamala) - lotus']
                }
            ]
        };

        // Mock functions
        window.checkAnswer = function() {
            const answer = document.getElementById('answer').value.trim().toLowerCase();
            const letter = document.querySelector('.letter').textContent;
            const transliteration = document.querySelector('.transliteration').textContent;
            const resultDiv = document.getElementById('result');

            if (!answer) {
                resultDiv.textContent = 'Please enter your answer';
                resultDiv.className = 'error';
                return;
            }

            if (answer === transliteration) {
                resultDiv.textContent = 'Correct! Well done!';
                resultDiv.className = 'success';
                mockStorage.addLearntLetter(letter);
                mockStorage.updateLevelProgress();
            } else {
                resultDiv.textContent = 'Try again';
                resultDiv.className = 'error';
            }
        };

        // Add event listener
        document.getElementById('submitAnswer').addEventListener('click', window.checkAnswer);
    });

    afterEach(() => {
        document.body.removeChild(testContainer);
        jest.clearAllMocks();
    });

    describe('Answer Submission', () => {
        test('correct answer updates progress', () => {
            const answerInput = document.getElementById('answer');
            const submitButton = document.getElementById('submitAnswer');
            const resultDiv = document.getElementById('result');

            answerInput.value = 'a';
            submitButton.click();

            expect(mockStorage.addLearntLetter).toHaveBeenCalledWith('ಅ');
            expect(resultDiv.textContent).toContain('Correct');
            expect(resultDiv.className).toContain('success');
        });

        test('incorrect answer shows error', () => {
            const answerInput = document.getElementById('answer');
            const submitButton = document.getElementById('submitAnswer');
            const resultDiv = document.getElementById('result');

            answerInput.value = 'wrong';
            submitButton.click();

            expect(mockStorage.addLearntLetter).not.toHaveBeenCalled();
            expect(resultDiv.textContent).toContain('Try again');
            expect(resultDiv.className).toContain('error');
        });

        test('empty answer shows error', () => {
            const submitButton = document.getElementById('submitAnswer');
            const resultDiv = document.getElementById('result');

            submitButton.click();

            expect(mockStorage.addLearntLetter).not.toHaveBeenCalled();
            expect(resultDiv.textContent).toContain('Please enter');
            expect(resultDiv.className).toContain('error');
        });
    });

    describe('Letter Display', () => {
        test('displays letter correctly', () => {
            const letterDisplay = document.querySelector('.letter-display');
            
            expect(letterDisplay.querySelector('.letter').textContent).toBe('ಅ');
            expect(letterDisplay.querySelector('.transliteration').textContent).toBe('a');
            expect(letterDisplay.querySelector('.pronunciation').textContent).toBe('a as in about');
            expect(letterDisplay.querySelector('.example').textContent).toBe('ಅಮ್ಮ (amma) - mother');
        });
    });

    describe('Progress Tracking', () => {
        test('updates progress after correct answer', () => {
            const answerInput = document.getElementById('answer');
            const submitButton = document.getElementById('submitAnswer');

            answerInput.value = 'a';
            submitButton.click();

            expect(mockStorage.updateLevelProgress).toHaveBeenCalled();
            expect(mockStorage.getLevelProgress).toHaveBeenCalled();
        });
    });
}); 