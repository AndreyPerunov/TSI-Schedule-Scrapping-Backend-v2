FROM ghcr.io/puppeteer/puppeteer:21.7.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

EXPOSE 3000

COPY package*.json ./

RUN npm ci 

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

RUN npm run build