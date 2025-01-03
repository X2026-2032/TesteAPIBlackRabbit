# Stage 1: Install production dependencies
FROM node:16-alpine as builder

WORKDIR /app

COPY package.json package-lock.json /app/
COPY prisma ./prisma/

RUN npm ci

COPY . /app

# Generate Prisma client
RUN npx prisma generate

# Assuming you have a build script in your package.json
RUN npm run build --prod

# Stage 2: Create the final image
FROM node:16-alpine

WORKDIR /app
RUN npm install -g pm2

# Copy the built files from the builder stage
COPY --from=builder /app /app

# Install dependencies for Playwright
RUN apk --no-cache add \
  libstdc++ \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

# Set environment variables for Playwright
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Configure timezone
RUN apk --no-cache add tzdata \
  && cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
  && echo "America/Sao_Paulo" > /etc/timezone \
  && apk del tzdata

# Expose the necessary ports
EXPOSE 3000

CMD ["pm2-runtime", "start", "build/app.js", "--name", "bass_api"]