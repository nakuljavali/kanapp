// Define level structure
window.LEVELS = {
    // Level 1
    vowels_write: {
        id: 'vowels_write',
        number: 1,
        title: 'Vowels',
        mode: 'write',
        group: 'vowels',
        letters: window.letters.vowels,
        nextLevel: 'vowels_read',
        description: 'Learn to write Kannada vowels'
    },
    // Level 2
    vowels_read: {
        id: 'vowels_read',
        number: 2,
        title: 'Vowels',
        mode: 'read',
        group: 'vowels',
        letters: window.letters.vowels,
        nextLevel: 'consonants_velar_write',
        description: 'Learn to read Kannada vowels'
    },
    // Level 3
    consonants_velar_write: {
        id: 'consonants_velar_write',
        number: 3,
        title: 'Consonants - Velar (ಕ ವರ್ಗ)',
        mode: 'write',
        group: 'consonants_velar',
        letters: window.letters.consonants.velar,
        nextLevel: 'consonants_velar_read',
        description: 'Learn to write Kannada velar consonants'
    },
    // Level 4
    consonants_velar_read: {
        id: 'consonants_velar_read',
        number: 4,
        title: 'Consonants - Velar (ಕ ವರ್ಗ)',
        mode: 'read',
        group: 'consonants_velar',
        letters: window.letters.consonants.velar,
        nextLevel: 'consonants_palatal_write',
        description: 'Learn to read Kannada velar consonants'
    },
    // Level 5
    consonants_palatal_write: {
        id: 'consonants_palatal_write',
        number: 5,
        title: 'Consonants - Palatal (ಚ ವರ್ಗ)',
        mode: 'write',
        group: 'consonants_palatal',
        letters: window.letters.consonants.palatal,
        nextLevel: 'consonants_palatal_read',
        description: 'Learn to write Kannada palatal consonants'
    },
    // Level 6
    consonants_palatal_read: {
        id: 'consonants_palatal_read',
        number: 6,
        title: 'Consonants - Palatal (ಚ ವರ್ಗ)',
        mode: 'read',
        group: 'consonants_palatal',
        letters: window.letters.consonants.palatal,
        nextLevel: 'consonants_retroflex_write',
        description: 'Learn to read Kannada palatal consonants'
    },
    // Level 7
    consonants_retroflex_write: {
        id: 'consonants_retroflex_write',
        number: 7,
        title: 'Consonants - Retroflex (ಟ ವರ್ಗ)',
        mode: 'write',
        group: 'consonants_retroflex',
        letters: window.letters.consonants.retroflex,
        nextLevel: 'consonants_retroflex_read',
        description: 'Learn to write Kannada retroflex consonants'
    },
    // Level 8
    consonants_retroflex_read: {
        id: 'consonants_retroflex_read',
        number: 8,
        title: 'Consonants - Retroflex (ಟ ವರ್ಗ)',
        mode: 'read',
        group: 'consonants_retroflex',
        letters: window.letters.consonants.retroflex,
        nextLevel: 'consonants_dental_write',
        description: 'Learn to read Kannada retroflex consonants'
    },
    // Level 9
    consonants_dental_write: {
        id: 'consonants_dental_write',
        number: 9,
        title: 'Consonants - Dental (ತ ವರ್ಗ)',
        mode: 'write',
        group: 'consonants_dental',
        letters: window.letters.consonants.dental,
        nextLevel: 'consonants_dental_read',
        description: 'Learn to write Kannada dental consonants'
    },
    // Level 10
    consonants_dental_read: {
        id: 'consonants_dental_read',
        number: 10,
        title: 'Consonants - Dental (ತ ವರ್ಗ)',
        mode: 'read',
        group: 'consonants_dental',
        letters: window.letters.consonants.dental,
        nextLevel: 'consonants_labial_write',
        description: 'Learn to read Kannada dental consonants'
    },
    // Level 11
    consonants_labial_write: {
        id: 'consonants_labial_write',
        number: 11,
        title: 'Consonants - Labial (ಪ ವರ್ಗ)',
        mode: 'write',
        group: 'consonants_labial',
        letters: window.letters.consonants.labial,
        nextLevel: 'consonants_labial_read',
        description: 'Learn to write Kannada labial consonants'
    },
    // Level 12
    consonants_labial_read: {
        id: 'consonants_labial_read',
        number: 12,
        title: 'Consonants - Labial (ಪ ವರ್ಗ)',
        mode: 'read',
        group: 'consonants_labial',
        letters: window.letters.consonants.labial,
        nextLevel: null,
        description: 'Learn to read Kannada labial consonants'
    }
};

// Helper functions for levels
window.LevelManager = {
    // Get level by ID
    getLevel: function(levelId) {
        return window.LEVELS[levelId];
    },

    // Get next level
    getNextLevel: function(currentLevelId) {
        const currentLevel = this.getLevel(currentLevelId);
        return currentLevel ? this.getLevel(currentLevel.nextLevel) : null;
    },

    // Get all letters for a level
    getLevelLetters: function(levelId) {
        const level = this.getLevel(levelId);
        return level ? level.letters : [];
    },

    // Generate HTML for a level
    generateLevelHTML: function(levelId) {
        const level = this.getLevel(levelId);
        if (!level) return '';

        return `
            <div class="level" data-level-id="${level.id}">
                <div class="level-header">
                    <span class="level-number">Level ${level.number}</span>
                    <span class="level-type">
                        <span class="material-icons">${level.mode === 'write' ? 'edit' : 'visibility'}</span>
                        ${level.mode === 'write' ? 'Write' : 'Read'}
                    </span>
                </div>
                <h2>${level.title}</h2>
                <a href="${level.mode}.html?level=${level.group}" class="start-button">Start Practice</a>
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
            </div>
        `;
    },

    // Generate all levels HTML
    generateAllLevelsHTML: function() {
        return Object.keys(window.LEVELS)
            .map(levelId => this.generateLevelHTML(levelId))
            .join('');
    }
};