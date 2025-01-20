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