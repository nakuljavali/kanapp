// Export the letter data
const kannadaLetters = {
    vowels: [
        {
            letter: "ಅ",
            pronunciation: "a",
            transliteration: "a",
            type: "vowel",
            examples: ["ಅಮ್ಮ (amma - mother)", "ಅಪ್ಪ (appa - father)"]
        },
        {
            letter: "ಆ",
            pronunciation: "aa",
            transliteration: "aa",
            type: "vowel",
            examples: ["ಆನೆ (aane - elephant)", "ಆಕಾಶ (aakaasha - sky)"]
        },
        {
            letter: "ಇ",
            pronunciation: "i",
            transliteration: "i",
            type: "vowel",
            examples: ["ಇಲಿ (ili - mouse)", "ಇಂದು (indu - today)"]
        },
        {
            letter: "ಈ",
            pronunciation: "ee",
            transliteration: "ee",
            type: "vowel",
            examples: ["ಈಗ (eega - now)", "ಈಶ (eesha - god)"]
        },
        {
            letter: "ಉ",
            pronunciation: "u",
            transliteration: "u",
            type: "vowel",
            examples: ["ಉಡುಪಿ (udupi - city name)", "ಉಪ್ಪು (uppu - salt)"]
        },
        {
            letter: "ಊ",
            pronunciation: "oo",
            transliteration: "oo",
            type: "vowel",
            examples: ["ಊಟ (oota - meal)", "ಊರು (ooru - town)"]
        },
        {
            letter: "ಋ",
            pronunciation: "ru",
            transliteration: "ru",
            type: "vowel",
            examples: ["ಋಷಿ (rushi - sage)", "ಋತು (rutu - season)"]
        },
        {
            letter: "ಎ",
            pronunciation: "e",
            transliteration: "e",
            type: "vowel",
            examples: ["ಎಲೆ (ele - leaf)", "ಎಮ್ಮೆ (emme - buffalo)"]
        },
        {
            letter: "ಏ",
            pronunciation: "ae",
            transliteration: "ae",
            type: "vowel",
            examples: ["ಏಣಿ (aeni - ladder)", "ಏನು (aenu - what)"]
        },
        {
            letter: "ಐ",
            pronunciation: "ai",
            transliteration: "ai",
            type: "vowel",
            examples: ["ಐದು (aidu - five)", "ಐನೂರು (ainooru - five hundred)"]
        },
        {
            letter: "ಒ",
            pronunciation: "o",
            transliteration: "o",
            type: "vowel",
            examples: ["ಒಂದು (ondu - one)", "ಒಳ್ಳೆಯದು (olleyadu - good)"]
        },
        {
            letter: "ಓ",
            pronunciation: "o",
            transliteration: "o",
            type: "vowel",
            examples: ["ಓಡು (odu - run)", "ಓದು (odu - read)"]
        },
        {
            letter: "ಔ",
            pronunciation: "au",
            transliteration: "au",
            type: "vowel",
            examples: ["ಔಷಧಿ (aushadhi - medicine)", "ಔತಣ (autana - feast)"]
        }
    ],
    consonants: [
        {
            letter: "ಕ",
            pronunciation: "ka",
            transliteration: "ka",
            type: "consonant",
            examples: ["ಕಮಲ (kamala - lotus)", "ಕನ್ನಡ (kannada - Kannada)"]
        },
        {
            letter: "ಖ",
            pronunciation: "kha",
            transliteration: "kha",
            type: "consonant",
            examples: ["ಖಗ (khaga - bird)", "ಖನಿ (khani - mine)"]
        }
        // Add more consonants here
    ],
    numbers: [
        {
            letter: '೧',
            transliteration: '1',
            example: 'ಒಂದು',
            exampleTransliteration: 'ondu (one)'
        },
        {
            letter: '೨',
            transliteration: '2',
            example: 'ಎರಡು',
            exampleTransliteration: 'eradu (two)'
        }
        // Add more numbers here
    ]
};

function getAllLetters() {
    return [
        ...kannadaLetters.vowels,
        ...kannadaLetters.consonants,
        ...kannadaLetters.numbers
    ];
}

// Export for use in other files
window.letters = kannadaLetters;
window.getAllLetters = getAllLetters;

function createLetterGrid() {
    const grid = document.getElementById('lettersGrid');
    
    // Create section for each category
    for (const [category, letters] of Object.entries(kannadaLetters)) {
        // Add category header
        const categoryHeader = document.createElement('h2');
        categoryHeader.className = 'category-header';
        categoryHeader.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        grid.appendChild(categoryHeader);
        
        // Create grid for this category
        const categoryGrid = document.createElement('div');
        categoryGrid.className = 'category-grid';
        
        letters.forEach(letterObj => {
            const letterCard = document.createElement('div');
            letterCard.className = 'letter-card';
            
            letterCard.innerHTML = `
                <div class="letter">${letterObj.letter}</div>
                <div class="transliteration">${letterObj.transliteration}</div>
            `;
            
            letterCard.addEventListener('click', () => {
                localStorage.setItem('selectedLetter', letterObj.letter);
                localStorage.setItem('letterData', JSON.stringify(letterObj));
                window.location.href = 'practice.html?mode=practice';
            });
            
            categoryGrid.appendChild(letterCard);
        });
        
        grid.appendChild(categoryGrid);
    }
}

// Initialize the grid if we're on the letters page
if (document.getElementById('lettersGrid')) {
    createLetterGrid();
}

// Helper function to get random letter
window.getRandomLetter = function(type) {
    console.log('Getting random letter for type:', type);
    const letterSet = window.letters[type];
    
    if (!letterSet || letterSet.length === 0) {
        console.error('Invalid letter type or empty set:', type);
        return null;
    }
    
    const randomLetter = letterSet[Math.floor(Math.random() * letterSet.length)];
    console.log('Selected letter:', randomLetter);
    return randomLetter;
};

// Helper function to check answers
window.checkAnswer = function(letter, answer) {
    if (!letter) return false;
    const correctAnswers = [
        letter.transliteration,
        letter.pronunciation
    ];
    return correctAnswers.includes(answer.toLowerCase().trim());
};

console.log('Letters.js loaded with data:', window.letters);
