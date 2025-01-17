FROM openjdk:18-jdk-slim

ENV DEBIAN_FRONTEND noninteractive

#WORKDIR /
#=============================
# Install Dependenices
#=============================
SHELL ["/bin/bash", "-c"]

RUN apt update && apt install -y curl \
        sudo wget unzip bzip2 libdrm-dev \
        libxkbcommon-dev libgbm-dev libasound-dev libnss3 \
        libxcursor1 libpulse-dev libxshmfence-dev \
        xauth xvfb x11vnc fluxbox wmctrl libdbus-glib-1-2 socat \
        virt-manager

RUN apt install -y ffmpeg libsdl2-2.0-0 adb wget \
                 gcc git pkg-config meson ninja-build libsdl2-dev \
                 libavcodec-dev libavdevice-dev libavformat-dev libavutil-dev \
                 libswresample-dev libusb-1.0-0 libusb-1.0-0-dev \
                 pip vim
RUN apt install -y openssh-client

# Python3.12 upgrade
# 필요 패키지 업데이트 및 설치
RUN apt-get update && apt-get install -y \
    wget \
    build-essential \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    curl \
    libncursesw5-dev \
    xz-utils \
    tk-dev \
    libxml2-dev \
    libxmlsec1-dev \
    libffi-dev \
    liblzma-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Python 3.12 설치
RUN wget https://www.python.org/ftp/python/3.12.0/Python-3.12.0.tgz \
    && tar xzf Python-3.12.0.tgz \
    && cd Python-3.12.0 \
    && ./configure --enable-optimizations \
    && make -j 8 \
    && make altinstall \
    && cd .. \
    && rm -rf Python-3.12.0 Python-3.12.0.tgz

# 기본 Python3를 3.12로 설정
RUN ln -s /usr/local/bin/python3.12 /usr/local/bin/python3 \
    && ln -s /usr/local/bin/pip3.12 /usr/local/bin/pip3

# 설치된 Python 버전 확인
RUN python3 --version

# nvm 설치 및 Node.js 설치
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash \
    && export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" \
    && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
    && nvm install node \
    && nvm use node \
    && npm install -g appium \
    && appium driver install uiautomator2

RUN pip install Appium-Python-Client
RUN pip install fastapi
RUN pip install uvicorn[standard]
RUN pip install pipenv
RUN pipenv --python /usr/bin/python3
WORKDIR /root
RUN git clone https://github.com/Genymobile/scrcpy
WORKDIR /root/scrcpy
RUN ./install_release.sh

# git clone private repository clone
WORKDIR /root
RUN mkdir -p /root/.ssh
COPY ./.ssh/id_rsa /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa

## SSH 키의 호스트 검사 비활성화 (선택적)
RUN touch /root/.ssh/config
RUN echo "Host *\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config

# Docker labels.
LABEL maintainer "Halim Qarroum <hqm.post@gmail.com>"
LABEL description "A Docker image allowing to run an Android emulator"
LABEL version "1.0.0"


# Arguments that can be overriden at build-time.
ARG INSTALL_ANDROID_SDK=1
ARG API_LEVEL=33
ARG IMG_TYPE=google_apis
ARG ARCHITECTURE=x86_64
ARG CMD_LINE_VERSION=9477386_latest
ARG DEVICE_ID=pixel
ARG GPU_ACCELERATED=false

# Environment variables.
ENV ANDROID_SDK_ROOT=/opt/android \
        ANDROID_PLATFORM_VERSION="platforms;android-$API_LEVEL" \
        PACKAGE_PATH="system-images;android-${API_LEVEL};${IMG_TYPE};${ARCHITECTURE}" \
        API_LEVEL=$API_LEVEL \
        DEVICE_ID=$DEVICE_ID \
        ARCHITECTURE=$ARCHITECTURE \
        ABI=${IMG_TYPE}/${ARCHITECTURE} \
        GPU_ACCELERATED=$GPU_ACCELERATED \
        QTWEBENGINE_DISABLE_SANDBOX=1 \
        ANDROID_EMULATOR_WAIT_TIME_BEFORE_KILL=10 \
        ANDROID_AVD_HOME=/data \
        LIBGL_ALWAYS_INDIRECT=1


# Exporting environment variables to keep in the path
# Android SDK binaries and shared libraries.
ENV PATH "${PATH}:${ANDROID_SDK_ROOT}/platform-tools"
ENV PATH "${PATH}:${ANDROID_SDK_ROOT}/emulator"
ENV PATH "${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/tools/bin"
ENV LD_LIBRARY_PATH "$ANDROID_SDK_ROOT/emulator/lib64:$ANDROID_SDK_ROOT/emulator/lib64/qt/lib"

# Set the working directory to /opt
WORKDIR /opt

# Exposing the Android emulator console port
# and the ADB port.
EXPOSE 5554 5555

# Initializing the required directories.
RUN mkdir /root/.android/ && \
        touch /root/.android/repositories.cfg && \
        mkdir /data

# Exporting ADB keys.
COPY keys/* /root/.android/

# The following layers will download the Android command-line tools
# to install the Android SDK, emulator and system images.
# It will then install the Android SDK and emulator.
COPY scripts/install-sdk.sh /opt/
RUN chmod +x /opt/install-sdk.sh
RUN /opt/install-sdk.sh

# Copy the container scripts in the image.
COPY scripts/start-emulator.sh /opt/
COPY scripts/emulator-monitoring.sh /opt/
RUN chmod +x /opt/*.sh

# Set the entrypoint
ENTRYPOINT ["/opt/start-emulator.sh"]