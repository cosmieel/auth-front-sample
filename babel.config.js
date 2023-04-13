module.exports = {
    presets : [
        [
            '@babel/preset-env', {
                modules : false,
            },
        ],
    ],

    plugins : [
        '@babel/plugin-transform-destructuring',
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-transform-runtime',
    ],

    env : {
        test : {
            plugins : [
                '@babel/plugin-transform-runtime',
                '@babel/plugin-transform-modules-commonjs',
                'dynamic-import-node',
            ],
        },
    },
};
