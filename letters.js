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
    consonants: {
        velar: [
            { letter: "ಕ", transliteration: "ka", pronunciation: "like 'k' in 'kite'", examples: "ಕಮಲ (kamala) - lotus" },
            { letter: "ಖ", transliteration: "kha", pronunciation: "aspirated 'k'", examples: "ಖಗ (khaga) - bird" },
            { letter: "ಗ", transliteration: "ga", pronunciation: "like 'g' in 'gate'", examples: "ಗಣಿತ (ganita) - mathematics" },
            { letter: "ಘ", transliteration: "gha", pronunciation: "aspirated 'g'", examples: "ಘಟ (ghata) - pot" },
            { letter: "ಙ", transliteration: "ṅa", pronunciation: "like 'ng' in 'sing'", examples: "ಅಙ್ಕ (anka) - number" }
        ],
        palatal: [
            { letter: "ಚ", transliteration: "ca", pronunciation: "like 'ch' in 'chair'", examples: "ಚಂದ್ರ (chandra) - moon" },
            { letter: "ಛ", transliteration: "cha", pronunciation: "aspirated 'ch'", examples: "ಛತ್ರಿ (chatri) - umbrella" },
            { letter: "ಜ", transliteration: "ja", pronunciation: "like 'j' in 'joy'", examples: "ಜಲ (jala) - water" },
            { letter: "ಝ", transliteration: "jha", pronunciation: "aspirated 'j'", examples: "ಝರಿ (jhari) - waterfall" },
            { letter: "ಞ", transliteration: "ña", pronunciation: "like 'ny' in 'canyon'", examples: "ಪುಞ್ಜ (punja) - heap" }
        ],
        retroflex: [
            { letter: "ಟ", transliteration: "ṭa", pronunciation: "hard 't'", examples: "ಟೊಮೆಟೊ (tomato) - tomato" },
            { letter: "ಠ", transliteration: "ṭha", pronunciation: "aspirated hard 't'", examples: "ಠೇವಣಿ (thevani) - deposit" },
            { letter: "ಡ", transliteration: "ḍa", pronunciation: "hard 'd'", examples: "ಡಬ್ಬ (dabba) - box" },
            { letter: "ಢ", transliteration: "ḍha", pronunciation: "aspirated hard 'd'", examples: "ಢಕ್ಕೆ (dhakke) - drum" },
            { letter: "ಣ", transliteration: "ṇa", pronunciation: "retroflex 'n'", examples: "ಕಣ್ಣು (kannu) - eye" }
        ],
        dental: [
            { letter: "ತ", transliteration: "ta", pronunciation: "soft 't'", examples: "ತಂದೆ (tande) - father" },
            { letter: "ಥ", transliteration: "tha", pronunciation: "aspirated soft 't'", examples: "ಥಟ್ಟನೆ (thattane) - suddenly" },
            { letter: "ದ", transliteration: "da", pronunciation: "soft 'd'", examples: "ದೀಪ (dīpa) - lamp" },
            { letter: "ಧ", transliteration: "dha", pronunciation: "aspirated soft 'd'", examples: "ಧನ (dhana) - wealth" },
            { letter: "ನ", transliteration: "na", pronunciation: "like 'n' in 'net'", examples: "ನಾಯಿ (nāyi) - dog" }
        ],
        labial: [
            { letter: "ಪ", transliteration: "pa", pronunciation: "like 'p' in 'pen'", examples: "ಪುಸ್ತಕ (pustaka) - book" },
            { letter: "ಫ", transliteration: "pha", pronunciation: "aspirated 'p'", examples: "ಫಲ (phala) - fruit" },
            { letter: "ಬ", transliteration: "ba", pronunciation: "like 'b' in 'boy'", examples: "ಬಾಗಿಲು (bāgilu) - door" },
            { letter: "ಭ", transliteration: "bha", pronunciation: "aspirated 'b'", examples: "ಭೂಮಿ (bhūmi) - earth" },
            { letter: "ಮ", transliteration: "ma", pronunciation: "like 'm' in 'mother'", examples: "ಮನೆ (mane) - house" }
        ],
        other: [
            { letter: "ಯ", transliteration: "ya", pronunciation: "like 'y' in 'yes'", examples: "ಯಮುನಾ (yamunā) - Yamuna" },
            { letter: "ರ", transliteration: "ra", pronunciation: "like 'r' in 'run'", examples: "ರವಿ (ravi) - sun" },
            { letter: "ಲ", transliteration: "la", pronunciation: "like 'l' in 'light'", examples: "ಲತೆ (late) - creeper" },
            { letter: "ವ", transliteration: "va", pronunciation: "like 'v' in 'vine'", examples: "ವನ (vana) - forest" },
            { letter: "ಶ", transliteration: "śa", pronunciation: "like 'sh' in 'shine'", examples: "ಶಾಲೆ (śāle) - school" },
            { letter: "ಷ", transliteration: "ṣa", pronunciation: "like 'sh' in 'shore'", examples: "ಷಟ್ಪದಿ (ṣaṭpadi) - hexapod" },
            { letter: "ಸ", transliteration: "sa", pronunciation: "like 's' in 'sun'", examples: "ಸರ (sara) - necklace" },
            { letter: "ಹ", transliteration: "ha", pronunciation: "like 'h' in 'house'", examples: "ಹಕ್ಕಿ (hakki) - bird" },
            { letter: "ಳ", transliteration: "ḷa", pronunciation: "retroflex 'l'", examples: "ಬೆಳೆ (beḷe) - crop" }
        ]
    },
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
        ...kannadaLetters.consonants.velar,
        ...kannadaLetters.consonants.palatal,
        ...kannadaLetters.consonants.retroflex,
        ...kannadaLetters.consonants.dental,
        ...kannadaLetters.consonants.labial,
        ...kannadaLetters.consonants.other,
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
