module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@redux': './src/redux',
          '@assets': './src/assets',
          '@icons': './src/assets/icons',
          '@images': './src/assets/images',
          '@utils': './src/utility',
          '@authScreens': './src/screens/authScreens',
          // '@otherScreens': './src/screens/otherScreens',
          '@schemas': './src/validationSchemas',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env', 
        path: '.env',     
        safe: false,       
        allowUndefined: true,
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
