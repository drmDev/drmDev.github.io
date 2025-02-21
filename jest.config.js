// File: jest.config.js
export default {
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'json'],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/__tests__/**/*.js'
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/_site/'
    ],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    moduleDirectories: ['node_modules'],
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
    },
    verbose: true
}