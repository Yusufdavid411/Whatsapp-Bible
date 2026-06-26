# WhatsApp Bible

A complete free WhatsApp Bible chatbot built with Node.js, Express, `whatsapp-web.js`, LocalAuth, SQLite, `node-cron`, `dotenv`, `axios`, and `qrcode-terminal`.

This project does not use the official WhatsApp Business API and does not require Firebase.

## Features

- WhatsApp Web login with terminal QR code
- LocalAuth session persistence after restart
- Personal chat support
- WhatsApp group support when the bot is tagged
- Automatic user registration
- Local SQLite database persistence
- Bible reference detection
- Daily reminders
- Verse of the day
- User profiles
- Usage statistics
- Admin commands
- Express health and stats endpoints

## Folder Structure

```text
.
├── data
│   └── .gitkeep
├── src
│   ├── bot.js
│   ├── server.js
│   ├── config
│   │   └── database.js
│   ├── services
│   │   ├── bibleService.js
│   │   ├── userService.js
│   │   ├── reminderService.js
│   │   └── statsService.js
│   ├── handlers
│   │   ├── messageHandler.js
│   │   └── groupHandler.js
│   ├── commands
│   │   ├── helpCommand.js
│   │   ├── profileCommand.js
│   │   ├── reminderCommand.js
│   │   ├── planCommand.js
│   │   └── adminCommand.js
│   └── utils
│       ├── scriptureParser.js
│       └── dateUtils.js
├── package.json
├── .env.example
├── DEPLOYMENT.md
└── README.md
```

## Requirements

- Node.js 20, 22, 23, 24, 25, or 26
- A WhatsApp account for the bot

## Installation

```bash
npm install
cp .env.example .env
```

On Windows PowerShell:

```powershell
npm install
Copy-Item .env.example .env
```

The `.env` file has already been created in this workspace.

## Environment Variables

```env
PORT=3000
NODE_ENV=development
BOT_NAME=WhatsAppBible
WHATSAPP_SESSION_NAME=whatsapp-bible
WHATSAPP_PAIR_WITH_PHONE=12345678901
ADMIN_NUMBERS=234XXXXXXXXXX
DATABASE_PATH=data/whatsapp-bible.sqlite
BIBLE_API_BASE_URL=https://bible-api.com
BIBLE_TRANSLATION=kjv
TIMEZONE=Africa/Lagos
DEFAULT_REMINDER_TIME=06:00
```

Set `ADMIN_NUMBERS` to comma-separated WhatsApp phone numbers in international format without `+`.

If you prefer pairing with a phone number instead of QR login, set `WHATSAPP_PAIR_WITH_PHONE` to your WhatsApp number in international format without `+`.

Example:

```env
ADMIN_NUMBERS=2348012345678,2348098765432
```

## Database

The bot uses SQLite through `better-sqlite3`.

Default database file:

```text
data/whatsapp-bible.sqlite
```

Tables are created automatically on startup:

```text
users
groups
stats
daily_active_users
```

The database file is ignored by git so private chat/user data is not committed.

## Run

```bash
npm start
```

The app starts an Express server and initializes the WhatsApp bot.

## Scan QR Code

1. Run `npm start`.
2. A QR code appears in the terminal.
3. Open WhatsApp on your phone.
4. Go to **Linked devices**.
5. Scan the QR code.
6. Leave the app running.

The session is stored in `.wwebjs_auth/`, so restarts do not require a new scan unless WhatsApp logs out.

## Commands

```text
/help
/profile
/verse John 3:16
/reminder on
/reminder off
/setreminder 06:00
/stats
/verseoftheday
/plan start
/plan off
```

Admin commands:

```text
/admin users
/admin stats
/admin broadcast MESSAGE
```

Only phone numbers in `ADMIN_NUMBERS` can run admin commands.

## Bible Lookup

The bot detects references like:

```text
John 3:16
john 3 16
Psalm 23:1
Genesis 1:1
Romans 8:28
```

It uses the free API configured by `BIBLE_API_BASE_URL`.

## Group Usage

Add the bot account to a WhatsApp group and tag it:

```text
@WhatsAppBible Psalm 23:1
@WhatsAppBible /verse John 3:16
@WhatsAppBible /help
```

The bot ignores unrelated group messages.

## Data Model

```text
users
  phone
  name
  joinedAt
  lastSeen
  totalMessages
  reminderEnabled
  reminderTime
  readingPlan
  lastReminderSent

groups
  groupId
  groupName
  joinedAt

stats
  key
  value

daily_active_users
  dateKey
  phone
```

## Express Endpoints

```text
GET /
GET /health
GET /stats
```

## Troubleshooting

### QR code keeps appearing

The WhatsApp session is not authenticated yet, or `.wwebjs_auth/` was deleted. Scan the QR code again.

### Database error

Confirm `DATABASE_PATH` points to a writable location. The default `data/whatsapp-bible.sqlite` works for local use.

### Bible verses fail to load

Check internet access and confirm `BIBLE_API_BASE_URL=https://bible-api.com`.

### Bot does not reply in groups

Mention the bot in the group message. The bot intentionally ignores unrelated group messages.

### Chromium fails to start on Linux

Install the packages listed in [DEPLOYMENT.md](DEPLOYMENT.md).

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md).
