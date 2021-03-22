FROM node:14-slim

RUN mkdir -p /home/qape

WORKDIR /home/qape

# Dependencies needed for chrome
RUN apt-get update && apt-get install -y \
  gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
  libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 \
  libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 \
  libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 \
  libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation \
  libappindicator1 libnss3 lsb-release xdg-utils wget dumb-init \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd -r qape && useradd -r -g qape -G audio,video qape \
    && mkdir -p /home/qape/Downloads \
    && chown -R qape:qape /home/qape

# Run everything after as non-privileged user.
USER qape

ARG QAPE_VERSION=latest

RUN echo "Installing QApe v$QAPE_VERSION"

RUN npm install qape@$QAPE_VERSION

# Add default config with extra args for chrome to run in docker
ADD utils/docker/qape.conf.js /home/qape/

ENTRYPOINT ["/usr/bin/dumb-init", "--", "node_modules/.bin/qape"]
