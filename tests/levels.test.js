/**
 * @jest-environment jsdom
 */

const LevelManager = require('../levels.js');

describe('LevelManager Tests', () => {
    beforeEach(() => {
        window.LEVELS = {
            vowels_write: {
                id: 'vowels_write',
                title: 'Vowels',
                type: 'write',
                letters: ['ಅ', 'ಆ']
            },
            consonants_velar_write: {
                id: 'consonants_velar_write',
                title: 'Consonants - Velar',
                type: 'write',
                letters: ['ಕ', 'ಖ']
            }
        };
    });

    test('getLevel returns correct level', () => {
        const level = LevelManager.getLevel('vowels_write');
        expect(level).toEqual(window.LEVELS.vowels_write);
    });

    test('getLevel returns null for invalid level', () => {
        const level = LevelManager.getLevel('invalid_level');
        expect(level).toBe(null);
    });

    test('getNextLevel returns correct next level', () => {
        const nextLevel = LevelManager.getNextLevel('vowels_write');
        expect(nextLevel).toBe('consonants_velar_write');
    });

    test('getNextLevel returns null for last level', () => {
        const nextLevel = LevelManager.getNextLevel('consonants_velar_write');
        expect(nextLevel).toBe(null);
    });

    test('getLevelLetters returns correct letters', () => {
        const letters = LevelManager.getLevelLetters('vowels_write');
        expect(letters).toEqual(['ಅ', 'ಆ']);
    });

    test('getLevelLetters returns empty array for invalid level', () => {
        const letters = LevelManager.getLevelLetters('invalid_level');
        expect(letters).toEqual([]);
    });

    test('generateLevelHTML returns correct HTML structure', () => {
        const html = LevelManager.generateLevelHTML('vowels_write');
        expect(html).toContain('Vowels');
        expect(html).toContain('vowels_write');
    });

    test('generateLevelHTML returns empty string for invalid level', () => {
        const html = LevelManager.generateLevelHTML('invalid_level');
        expect(html).toBe('');
    });

    test('generateAllLevelsHTML returns HTML for all levels', () => {
        const html = LevelManager.generateAllLevelsHTML();
        expect(html).toContain('Vowels');
        expect(html).toContain('Consonants - Velar');
    });
}); 