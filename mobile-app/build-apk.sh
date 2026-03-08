#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📦 1/2 — Android prebuild (expo prebuild)..."
npx expo prebuild --platform android --clean

echo ""
echo "🔨 2/2 — Release APK derleniyor (gradlew assembleRelease)..."
cd android
./gradlew assembleRelease
cd ..

APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
  echo ""
  echo "✅ APK hazır: $SCRIPT_DIR/$APK_PATH"
else
  echo "❌ APK bulunamadı: $APK_PATH"
  exit 1
fi
