module.exports = { 
    reporters: [ 
        'default', 
        ['jest-junit', { 
            outputDirectory: './test-reports', 
            outputName: 'junit.xml', 
        }], 
    ], 
};