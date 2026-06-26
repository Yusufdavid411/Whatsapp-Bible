const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const { handleIncomingMessage } = require('./handlers/messageHandler');

let client;
let reconnecting = false;

function createClient() {
  const phoneNumber = (process.env.WHATSAPP_PAIR_WITH_PHONE || process.env.WHATSAPP_PHONE_NUMBER || '').replace(/\D/g, '');
  const pairWithPhoneNumber = {
    phoneNumber,
    showNotification: process.env.WHATSAPP_PAIR_SHOW_NOTIFICATION !== 'false',
    intervalMs: Number(process.env.WHATSAPP_PAIR_INTERVAL_MS || 180000)
  };

  const puppeteerOptions = {
    headless: true,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-extensions',
      '--disable-gpu',
      '--window-size=1280,720'
    ]
  };

  if (phoneNumber) {
    console.log(`Phone-number pairing enabled for: ${phoneNumber}`);
    return new Client({
      authStrategy: new LocalAuth({
        clientId: process.env.WHATSAPP_SESSION_NAME || 'whatsapp-bible'
      }),
      puppeteer: puppeteerOptions,
      pairWithPhoneNumber
    });
  }

  return new Client({
    authStrategy: new LocalAuth({
      clientId: process.env.WHATSAPP_SESSION_NAME || 'whatsapp-bible'
    }),
    puppeteer: puppeteerOptions
  });
}

function attachEvents(activeClient) {
  activeClient.on('qr', async (qr) => {
    console.log('Scan this QR code with WhatsApp to log in:');
    qrcode.generate(qr, { small: true });

    try {
      const logsDir = path.resolve(process.cwd(), 'logs');
      fs.mkdirSync(logsDir, { recursive: true });
      await QRCode.toFile(path.join(logsDir, 'whatsapp-qr.png'), qr, {
        width: 512,
        margin: 2
      });
      fs.writeFileSync(path.join(logsDir, 'whatsapp-qr.txt'), qr);
      console.log('QR image saved to logs/whatsapp-qr.png');
    } catch (error) {
      console.error('Failed to save QR image:', error.message);
    }
  });

  activeClient.on('code', async (code) => {
    console.log('Enter this WhatsApp pairing code in your phone:');
    console.log(code);

    try {
      const logsDir = path.resolve(process.cwd(), 'logs');
      fs.mkdirSync(logsDir, { recursive: true });
      fs.writeFileSync(path.join(logsDir, 'whatsapp-pairing-code.txt'), code);
      console.log('Pairing code saved to logs/whatsapp-pairing-code.txt');
    } catch (error) {
      console.error('Failed to save pairing code:', error.message);
    }
  }).on('error', (error) => {
    console.error('WhatsApp client error:', error.message);
  });

  activeClient.on('loading_screen', (percent, message) => {
    console.log(`WhatsApp loading: ${percent}% ${message || ''}`.trim());
  });

  activeClient.on('authenticated', () => {
    console.log('WhatsApp authenticated. Session will persist with LocalAuth.');
  });

  activeClient.on('auth_failure', (message) => {
    console.error('WhatsApp authentication failed:', message);
  });

  activeClient.on('ready', () => {
    reconnecting = false;
    console.log('WhatsApp Bible bot is ready.');
  });

  activeClient.on('message', (message) => {
    handleIncomingMessage(activeClient, message).catch((error) => {
      console.error('Unhandled message error:', error);
    });
  });

  activeClient.on('disconnected', (reason) => {
    console.error('WhatsApp disconnected:', reason);
    reconnectClient();
  });
}

function reconnectClient() {
  if (reconnecting) {
    return;
  }

  reconnecting = true;
  setTimeout(async () => {
    try {
      console.log('Attempting WhatsApp reconnect...');
      await client.destroy().catch(() => {});
      client = createClient();
      attachEvents(client);
      await client.initialize();
    } catch (error) {
      console.error('Reconnect failed:', error.message);
      reconnecting = false;
      reconnectClient();
    }
  }, 5000);
}

function initBot() {
  if (client) {
    return client;
  }

  client = createClient();
  attachEvents(client);

  client.initialize().catch((error) => {
    console.error('Failed to initialize WhatsApp client:', error.message);
    // Don't reconnect on initialization errors to prevent crash loops
    console.log('Bot initialization failed. Please check configuration and restart.');
  });

  return client;
}

function getClient() {
  return client;
}

module.exports = {
  initBot,
  getClient
};
