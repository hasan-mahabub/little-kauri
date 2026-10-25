#!/usr/bin/env bash
# Builds LittleKauri-<version>.apk and .aab from the web app in the parent folder.
set -euo pipefail

cd "$(dirname "$0")"
WEB=..
ASSETS=app/src/main/assets/www
IMAGE=little-kauri-android
VERSION=$(sed -n "s/.*versionName '\(.*\)'.*/\1/p" app/build.gradle)

echo "Copying the web app into the Android assets"
rm -rf "$ASSETS"
mkdir -p "$ASSETS"
cp -r "$WEB"/index.html "$WEB"/styles.css "$WEB"/app.js "$WEB"/parent.js "$WEB"/privacy.html "$WEB"/icon.svg \
  "$WEB"/manifest.webmanifest "$WEB"/stages "$WEB"/sounds "$WEB"/fonts "$WEB"/images "$ASSETS"/

echo "Preparing the build image"
docker build -q -t "$IMAGE" . > /dev/null
mkdir -p .home .gradle-cache

RUN=(docker run --rm -u "$(id -u):$(id -g)" -v "$PWD:/project" -v "$(cd "$WEB" && pwd):/web" -w /project
     -e HOME=/project/.home -e GRADLE_USER_HOME=/project/.gradle-cache "$IMAGE")

# The same key must sign every future version, or Android refuses to update the installed app. Keep keystore/ safe.
if [[ ! -f keystore/little-kauri.jks ]]; then
  echo "Creating the signing key (first build only)"
  mkdir -p keystore
  PASSWORD=$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 20)
  printf 'password=%s\n' "$PASSWORD" > keystore/keystore.properties
  chmod 600 keystore/keystore.properties
  "${RUN[@]}" keytool -genkeypair -keystore keystore/little-kauri.jks -alias littlekauri \
    -keyalg RSA -keysize 2048 -validity 10000 -storepass "$PASSWORD" -keypass "$PASSWORD" \
    -dname "CN=Hasan, O=Little Kauri, C=NZ"
fi

echo "Building the Android APK and Play App Bundle"
"${RUN[@]}" gradle --no-daemon --quiet assembleRelease bundleRelease

cp app/build/outputs/apk/release/app-release.apk "$WEB/LittleKauri-$VERSION.apk"
cp app/build/outputs/bundle/release/app-release.aab "$WEB/LittleKauri-$VERSION.aab"
mkdir -p "$WEB/play-store-assets"
"${RUN[@]}" rsvg-convert --width 512 --height 512 /web/icon.svg \
  --output /web/play-store-assets/app-icon-512.png
"${RUN[@]}" rsvg-convert --width 1024 --height 500 /web/play-store-assets/feature-graphic.svg \
  --output /web/play-store-assets/feature-graphic-1024x500.png
echo "Done: $(cd "$WEB" && pwd)/LittleKauri-$VERSION.aab"
echo "Sideload APK: $(cd "$WEB" && pwd)/LittleKauri-$VERSION.apk"
