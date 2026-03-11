#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📦 1/2 — Android prebuild (expo prebuild)..."
npx expo prebuild --platform android --clean

# prebuild --clean android'u sıfırladığı için local.properties yeniden yazılır
SDK_DIR="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
echo "sdk.dir=$SDK_DIR" > android/local.properties

echo ""
echo "🔨 2/2 — Release APK derleniyor (gradlew assembleRelease)..."
cd android
./gradlew assembleRelease
cd ..

APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
  PARENT_DIR="$(dirname "$SCRIPT_DIR")"
  DEST="$PARENT_DIR/app-release.apk"
  cp "$APK_PATH" "$DEST"
  echo ""
  echo "✅ APK hazır: $DEST"
else
  echo "❌ APK bulunamadı: $APK_PATH"
  exit 1
fi
