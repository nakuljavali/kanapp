module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/mocks/fileMock.js'
    },
    testMatch: [
        '<rootDir>/tests/**/*.test.js'
    ],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    collectCoverageFrom: [
        '**/*.{js,jsx}',
        '!**/node_modules/**',
        '!**/vendor/**',
        '!**/coverage/**',
        '!jest.config.js',
        '!babel.config.js'
    ],
    coverageReporters: ['lcov', 'text', 'text-summary'],
    coverageDirectory: 'coverage'
}; 