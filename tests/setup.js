// File: tests/setup.js
import '@testing-library/jest-dom';

// Export the setup configuration
export const setupTestEnvironment = () => {
    global.window = {
        location: {
            hostname: 'localhost'
        }
    };

    global.bootstrap = {
        Modal: class {
            constructor() {
                this.show = jest.fn();
                this.hide = jest.fn();
            }

            static getInstance(element) {
                const modalInstance = new this();
                return modalInstance;
            }
        }
    };
};

// Execute the setup
setupTestEnvironment();