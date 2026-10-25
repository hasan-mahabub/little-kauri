# Build environment for Little Kauri APKs and Play App Bundles: JDK 17, Gradle 9.6 and Android 36 SDK.
FROM gradle:9.6-jdk17

ENV ANDROID_SDK_ROOT=/opt/android-sdk \
    ANDROID_HOME=/opt/android-sdk

RUN apt-get update \
 && apt-get install -y --no-install-recommends unzip curl librsvg2-bin \
 && rm -rf /var/lib/apt/lists/*

RUN mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools" \
 && curl -fsSL -o /tmp/tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip \
 && unzip -q /tmp/tools.zip -d "$ANDROID_SDK_ROOT/cmdline-tools" \
 && mv "$ANDROID_SDK_ROOT/cmdline-tools/cmdline-tools" "$ANDROID_SDK_ROOT/cmdline-tools/latest" \
 && rm /tmp/tools.zip

RUN yes | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --licenses > /dev/null \
 && "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" "platforms;android-36" "build-tools;36.0.0" "platform-tools" > /dev/null \
 && chmod -R a+rX "$ANDROID_SDK_ROOT"
