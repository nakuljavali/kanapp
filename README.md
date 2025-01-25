# KanApp - Learn Kannada Script

A web application for learning the Kannada script through interactive writing and reading practice.

## Features

- Progressive learning path from basic vowels to complex consonants
- Interactive writing practice with real-time feedback
- Reading practice with multiple choice questions
- Daily review system for spaced repetition
- Progress tracking and statistics
- Mobile-friendly interface

## Code Organization

### Core Files
- `index.html` - Main entry point and learning tree interface
- `practice.html` - Writing practice interface
- `read.html` - Reading practice interface
- `settings.html` - User settings and preferences

### JavaScript Files
- `script.js` - Core application logic
  - Canvas handling for writing practice
  - Letter progression system
  - Daily review logic
  - Progress tracking
  - Stage management

- `storage.js` - Data persistence layer
  - Letter learning progress
  - Statistics tracking
  - Review scheduling
  - Level progress management

- `letters.js` - Letter data and configurations
  - Kannada letter definitions
  - Transliterations
  - Examples
  - Groupings (vowels, consonants)

- `menu.js` - Navigation and menu handling
  - Hamburger menu functionality
  - Navigation between sections
  - Mobile responsiveness

### Styles
- `styles.css` - Application styling
  - Responsive design
  - Learning tree layout
  - Practice interfaces
  - Menu and navigation
  - Letter cards and grids

## Customer User Journeys (CUJs)

### 1. Learning New Letters
1. User starts at the learning tree on the home page
2. Selects a level (e.g., vowels, consonants)
3. Practices writing the letter with real-time feedback
4. Gets success message when accuracy is sufficient
5. Letter is marked as learned and progress is saved
6. Unlocks next level when all letters in current level are mastered

### 2. Daily Review System
1. User visits home page and sees daily review section
2. System shows up to 20 previously learned letters that need review
   - Letters not reviewed in the last 24 hours
   - Prioritized by accuracy (lower accuracy first)
   - Excludes letters learned today
3. User clicks "Start Review" to begin practice
4. Alternates between writing and reading practice based on performance
5. Gets completion message when all review letters are practiced

### 3. Progress Tracking
1. User can view progress in the learning tree
2. Each level shows completion percentage
3. Stages unlock progressively based on previous stage completion
4. Can view detailed statistics for each learned letter:
   - Writing accuracy
   - Reading accuracy
   - Last practice dates
   - Learning dates

## Core Logic

### Writing Practice
- Canvas-based drawing interface
- Real-time stroke capture
- Similarity calculation for accuracy
- Automatic submission after drawing pause
- Success threshold at 30% similarity

### Reading Practice
- Multiple choice interface
- Random letter selection from current level
- Correct/incorrect feedback
- Progress tracking for both modes

### Review System
```javascript
// Review letter selection criteria
- Not reviewed in the last 24 hours
- Not learned today
- Prioritized by:
  1. Lower accuracy first
  2. Oldest review date
- Maximum 20 letters per day
```

### Progress Tracking
```javascript
// Level progress calculation
progress = (completed_letters / total_letters) * 100

// Stage unlocking
stage_n_unlocked = stage_n-1_progress === 100

// Letter mastery tracking
letter_stats = {
    correct: number_of_correct_attempts,
    total: total_attempts,
    lastReviewed: timestamp,
    learnedDate: timestamp
}
```

## Storage Structure
```javascript
// Local Storage Keys
{
    'learntLetters': [{ letter, learnedDate, lastReviewed }],
    'letterStats': {
        [letter]: {
            read: { correct, total, lastReviewed },
            write: { correct, total, lastReviewed }
        }
    },
    'levelProgress': {
        'vowels_write': percentage,
        'vowels_read': percentage,
        'consonants_group_write': percentage,
        'consonants_group_read': percentage
    }
}
```

# KanApp Test Suite Documentation

This document describes the test suite for the Kannada Script Learning Application (KanApp).

## Test Structure

The test suite is organized into several test groups that cover different aspects of the application's functionality:

### 1. Canvas Setup Tests
Tests the initialization and configuration of the canvas element:
- Verifies correct canvas property settings (stroke style, line width, etc.)
- Confirms proper event listener attachment
- Validates canvas dimensions and context initialization

### 2. Drawing Function Tests
Tests the core drawing functionality:
- `startDrawing`: Verifies drawing state initialization
- `stopDrawing`: Ensures proper cleanup when drawing stops
- `draw`: Tests actual drawing operations
  - Confirms line drawing when isDrawing is true
  - Verifies no drawing occurs when isDrawing is false

### 3. Canvas Operations Tests
Tests canvas manipulation functions:
- `clearCanvas`: Verifies proper canvas clearing
- `checkDrawing`: Tests the drawing validation system
  - Validates similarity calculation
  - Confirms proper feedback messages

### 4. Similarity Calculation Tests
Tests the algorithm that determines how well a drawn character matches the target:
- Tests empty canvas detection
- Verifies proper scoring for drawn content
- Validates percentage calculations

## Running Tests

To run the tests:

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Environment

The test suite uses Jest with jsdom for DOM simulation. Key components:

- **Mock Canvas**: Simulates HTML5 Canvas API
- **Mock Context**: Provides drawing context methods
- **Mock DOM Elements**: Simulates required DOM elements
- **Mock Storage**: Provides localStorage simulation
- **Mock Window Properties**: Simulates browser environment

## Test Files

- `tests/canvas.test.js`: Main test file for canvas functionality
- `tests/setup.js`: Test environment configuration
- `package.json`: Test runner configuration

## Coverage Areas

The test suite covers:
- Canvas initialization and setup
- Drawing state management
- User interaction handling
- Character similarity calculation
- Progress tracking
- Error handling

## Adding New Tests

When adding new tests:
1. Use the existing mock objects in `setup.js`
2. Follow the established pattern in `canvas.test.js`
3. Ensure proper cleanup in `beforeEach` blocks
4. Add appropriate assertions
5. Update this documentation

## Debugging Tests

If tests fail:
1. Check the console output for specific failure messages
2. Verify mock object initialization
3. Ensure all required DOM elements are properly mocked
4. Check for proper cleanup between tests
5. Verify test environment setup 