const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1. Three.js modülleri genellikle .mjs kullanır, bunları güvenli bir şekilde ekleyelim
if (config.resolver) {
  config.resolver.sourceExtensions = [
    ...(config.resolver.sourceExtensions || []),
    'mjs',
    'cjs',
  ];

  // 2. Three.js ve web-only stub'ları için özel resolver
  const originalResolveRequest = config.resolver.resolveRequest;

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // Web'de react-native-google-mobile-ads native modül kullanır; stub'a yönlendir
    if (platform === 'web' && moduleName === 'react-native-google-mobile-ads') {
      return {
        filePath: path.resolve(__dirname, 'stubs/react-native-google-mobile-ads.js'),
        type: 'sourceFile',
      };
    }

    // Eğer three/examples/jsm içinden bir dosya isteniyorsa ve uzantısı yoksa .js ekleyelim
    if (
      moduleName.startsWith('three/examples/jsm/') &&
      !moduleName.endsWith('.js')
    ) {
      try {
        return context.resolveRequest(context, `${moduleName}.js`, platform);
      } catch (e) {
        // .js ile bulunamazsa orjinal isme geri dön
      }
    }

    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
