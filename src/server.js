require('dotenv').config();

const express = require('express');
const { databasePath } = require('./config/database');
const { initBot } = require('./bot');
const { initReminderScheduler } = require('./services/reminderService');
const statsService = require('./services/statsService');

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'WhatsApp Bible',
    status: 'running',
    commands: ['/help', '/verse John 3:16', '/profile', '/verseoftheday']
  });
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    databasePath,
    timestamp: new Date().toISOString()
  });
});

app.get('/stats', async (req, res) => {
  try {
    const stats = await statsService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

const client = initBot();
initReminderScheduler(client);

const server = app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

server.on('error', async (error) => {
  console.error('Express server failed to start:', error.message);

  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Set a different PORT or stop the existing process.`);
  }

  try {
    if (client) {
      await client.destroy();
      console.log('WhatsApp client destroyed due to server startup failure.');
    }
  } catch (destroyError) {
    console.error('Error destroying WhatsApp client after startup failure:', destroyError.message);
  } finally {
    process.exit(1);
  }
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  server.close(async () => {
    try {
      await client.destroy();
    } catch (error) {
      console.error('Error while destroying WhatsApp client:', error.message);
    } finally {
      process.exit(0);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
