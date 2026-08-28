const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const { assetExts, sourceExts } = defaultConfig.resolver;

// --- Aliases ---
defaultConfig.resolver.alias = {
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@navigation': path.resolve(__dirname, 'src/navigation'),
  '@redux': path.resolve(__dirname, 'src/redux'),
  '@assets': path.resolve(__dirname, 'src/assets'),
  '@icons': path.resolve(__dirname, 'src/assets/icons'),
  '@images': path.resolve(__dirname, 'src/assets/images'),
  '@constant': path.resolve(__dirname, 'src/constant'),
  '@utils': path.resolve(__dirname, 'src/utility'),
  '@authScreens': path.resolve(__dirname, 'src/screens/authScreens'),
//   '@otherScreens': path.resolve(__dirname, 'src/screens/otherScreens'),
//   '@schemas': path.resolve(__dirname, 'src/validationSchemas'),
};

// --- Transformer config ---
defaultConfig.transformer = {
  ...defaultConfig.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// --- Fix asset + source extensions ---
defaultConfig.resolver = {
  ...defaultConfig.resolver,
  assetExts: assetExts.filter(ext => ext !== 'svg'), // keep png, jpg, etc
  sourceExts: [...sourceExts, 'svg',], // add svg support
};

module.exports = defaultConfig;
