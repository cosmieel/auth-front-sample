module.exports = {
    displayName : 'Auth tests',
    bail        : true,
    clearMocks  : true,
    roots       : [
        '<rootDir>/src/',
    ],
    testPathIgnorePatterns : ['/node_modules/'],
    testEnvironment        : 'jest-environment-jsdom-global',
    verbose                : false,
    globals                : {
        __base : `${__dirname}/src/`,
    },
    transform : {
        '.*\\.vue$'                                              : '<rootDir>/node_modules/vue-jest',
        '.+\\.(js)$'                                             : '<rootDir>/node_modules/babel-jest',
        '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$' : 'jest-transform-stub',
    },
    transformIgnorePatterns : [
        'node_modules/@regru/?!(design-system)',
    ],
    moduleNameMapper : {
        '^vue$'                      : 'vue/dist/vue.common.js',
        '^dictionary\\/(.+)\\.yaml$' : '<rootDir>/locales/$1.yaml',
        '@/(.*)$'                    : '<rootDir>/src/$1',
    },
    setupFiles : [
        './jest.init.js',
    ],
};
