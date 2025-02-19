import '@testing-library/jest-dom';

// Mock the window object
global.window = {
    location: {
        hostname: 'localhost'
    }
};

// Mock the bootstrap Modal
global.bootstrap = {
    Modal: class {
        constructor() { }
        show() { }
        hide() { }
        static getInstance() {
            return {
                hide: () => { }
            };
        }
    }
};