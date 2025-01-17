// Export the letter data
const kannadaLetters = {
    vowels: [
        {
            letter: 'ಅ',
            transliteration: 'a',
            example: 'ಅಮ್ಮ',
            exampleTransliteration: 'amma (mother)'
        },
        {
            letter: 'ಆ',
            transliteration: 'aa',
            example: 'ಆನೆ',
            exampleTransliteration: 'aane (elephant)'
        },
        {
            letter: 'ಇ',
            transliteration: 'i',
            example: 'ಇಲಿ',
            exampleTransliteration: 'ili (mouse)'
        },
        {
            letter: 'ಈ',
            transliteration: 'ii',
            example: 'ಈರುಳ್ಳಿ',
            exampleTransliteration: 'eerulli (onion)'
        },
        {
            letter: 'ಉ',
            transliteration: 'u',
            example: 'ಉಡುಪಿ',
            exampleTransliteration: 'udupi (city name)'
        },
        {
            letter: 'ಊ',
            transliteration: 'uu',
            example: 'ಊಟ',
            exampleTransliteration: 'oota (meal)'
        },
        {
            letter: 'ಋ',
            transliteration: 'ru',
            example: 'ಋಷಿ',
            exampleTransliteration: 'rushi (sage)'
        },
        {
            letter: 'ಎ',
            transliteration: 'e',
            example: 'ಎಲೆ',
            exampleTransliteration: 'ele (leaf)'
        },
        {
            letter: 'ಏ',
            transliteration: 'ee',
            example: 'ಏಣಿ',
            exampleTransliteration: 'eeni (ladder)'
        },
        {
            letter: 'ಐ',
            transliteration: 'ai',
            example: 'ಐದು',
            exampleTransliteration: 'aidu (five)'
        },
        {
            letter: 'ಒ',
            transliteration: 'o',
            example: 'ಒಂದು',
            exampleTransliteration: 'ondu (one)'
        },
        {
            letter: 'ಓ',
            transliteration: 'oo',
            example: 'ಓಡು',
            exampleTransliteration: 'oodu (run)'
        },
        {
            letter: 'ಔ',
            transliteration: 'au',
            example: 'ಔಷಧಿ',
            exampleTransliteration: 'aushadhi (medicine)'
        }
    ],
    consonants: [
        {
            letter: 'ಕ',
            transliteration: 'ka',
            example: 'ಕಮಲ',
            exampleTransliteration: 'kamala (lotus)'
        },
        {
            letter: 'ಖ',
            transliteration: 'kha',
            example: 'ಖಗ',
            exampleTransliteration: 'khaga (bird)'
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
window.kannadaLetters = kannadaLetters;
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
