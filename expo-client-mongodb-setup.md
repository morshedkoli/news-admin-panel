# React Native MongoDB Setup Guide

## Package Dependencies
Add these to your Expo project's package.json:

```json
{
  "dependencies": {
    "mongodb": "^6.1.0",
    "@react-native-async-storage/async-storage": "^1.19.3",
    "react-native-get-random-values": "^1.9.0",
    "react-native-polyfill-globals": "^3.1.0"
  },
  "devDependencies": {
    "metro-react-native-babel-preset": "^0.77.0",
    "@babel/plugin-proposal-async-generator-functions": "^7.20.7"
  }
}
```

## Metro Configuration
Add this to your metro.config.js:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// MongoDB support
config.resolver.assetExts.push('cjs');
config.resolver.sourceExts.push('cjs');

// Polyfill support
config.resolver.platforms = ['native', 'ios', 'android', 'web'];

module.exports = config;
```

## Babel Configuration
Add this to your babel.config.js:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-proposal-async-generator-functions',
      'react-native-reanimated/plugin'
    ]
  };
};
```

## App.js Polyfill Setup
Add at the very top of your App.js:

```javascript
import 'react-native-get-random-values';
import 'react-native-polyfill-globals/auto';
```

## Installation Commands

```bash
# Install MongoDB and dependencies
npm install mongodb @react-native-async-storage/async-storage react-native-get-random-values react-native-polyfill-globals

# Install dev dependencies
npm install --save-dev metro-react-native-babel-preset @babel/plugin-proposal-async-generator-functions

# Clear Metro cache
npx expo start --clear
```