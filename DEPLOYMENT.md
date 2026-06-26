# Deployment Guide

This project is free to run locally because it uses `whatsapp-web.js`, WhatsApp Web, LocalAuth, and SQLite. It does not use the official WhatsApp Business API.

## Local production run

```bash
npm install
cp .env.example .env
npm start
```

On Windows PowerShell:

```powershell
npm install
Copy-Item .env.example .env
npm start
```

Scan the QR code once. The WhatsApp session is saved in `.wwebjs_auth/`.

The SQLite database is saved at:

```text
data/whatsapp-bible.sqlite
```

## Keep it running

For a long-running free local deployment, use a spare computer or VPS that can keep Chrome running.

With PM2:

```bash
npm install -g pm2
pm2 start src/server.js --name whatsapp-bible
pm2 save
```

View logs:

```bash
pm2 logs whatsapp-bible
```

Restart:

```bash
pm2 restart whatsapp-bible
```

## Backups

Stop the app briefly, then back up:

```text
data/whatsapp-bible.sqlite
```

Also back up `.wwebjs_auth/` if you want to preserve the WhatsApp login session.

## Important deployment notes

- Do not delete `.wwebjs_auth/` unless you want to log in again.
- Keep `.env` private.
- Keep `data/whatsapp-bible.sqlite` private because it contains user data.
- Use one WhatsApp account dedicated to the bot.
- WhatsApp Web must remain allowed for that account.
- If WhatsApp logs out, run the app and scan the new QR code.

## Linux server dependencies

If Chromium fails to start on Linux, install common browser dependencies:

```bash
sudo apt-get update
sudo apt-get install -y \
  ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
  libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 \
  libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
  libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
  lsb-release wget xdg-utils
```
