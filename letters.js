// Export the letter data
const kannadaLetters = {
    vowels: [
        {
            letter: "ಅ",
            pronunciation: "a",
            examples: ["ಅಮ್ಮ (amma - mother)", "ಅಪ್ಪ (appa - father)"]
        },
        {
            letter: "ಆ",
            pronunciation: "aa",
            examples: ["ಆನೆ (aane - elephant)", "ಆಕಾಶ (aakaasha - sky)"]
        },
        {
            letter: "ಇ",
            pronunciation: "i",
            examples: ["ಇಲಿ (ili - mouse)", "ಇಂದು (indu - today)"]
        },
        {
            letter: "ಈ",
            pronunciation: "ee",
            examples: ["ಈಗ (eega - now)", "ಈಶ (eesha - god)"]
        },
        {
            letter: "ಉ",
            pronunciation: "u",
            examples: ["ಉಡುಪಿ (udupi - city name)", "ಉಪ್ಪು (uppu - salt)"]
        },
        {
            letter: "ಊ",
            pronunciation: "oo",
            examples: ["ಊಟ (oota - meal)", "ಊರು (ooru - town)"]
        },
        {
            letter: "ಋ",
            pronunciation: "ru",
            examples: ["ಋಷಿ (rushi - sage)", "ಋತು (rutu - season)"]
        },
        {
            letter: "ಎ",
            pronunciation: "e",
            examples: ["ಎಲೆ (ele - leaf)", "ಎಮ್ಮೆ (emme - buffalo)"]
        },
        {
            letter: "ಏ",
            pronunciation: "ae",
            examples: ["ಏಣಿ (aeni - ladder)", "ಏನು (aenu - what)"]
        },
        {
            letter: "ಐ",
            pronunciation: "ai",
            examples: ["ಐದು (aidu - five)", "ಐನೂರು (ainooru - five hundred)"]
        },
        {
            letter: "ಒ",
            pronunciation: "o",
            examples: ["ಒಂದು (ondu - one)", "ಒಳ್ಳೆಯದು (olleyadu - good)"]
        },
        {
            letter: "ಓ",
            pronunciation: "o",
            examples: ["ಓಡು (odu - run)", "ಓದು (odu - read)"]
        },
        {
            letter: "ಔ",
            pronunciation: "au",
            examples: ["ಔಷಧಿ (aushadhi - medicine)", "ಔತಣ (autana - feast)"]
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
