const mineflayer = require('mineflayer');
const express = require('express');

// Render'ın botu kapatmaması için web sunucusu
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('AFK Bot Aktif!'));
app.listen(PORT, () => console.log(`Web sunucu ${PORT} portunda aktif.`));

// Oyundaki kendi kullanıcı adın
const SAHIP_NICK = 'emir653688643';

const config = {
  host: 'metusmp.fun',
  port: 25565,
  username: 'votex', // Oyunculara çaktırmayacak gizli nick
  version: false
};

function createBot() {
  const bot = mineflayer.createBot(config);

  bot.on('spawn', () => {
    console.log('Bot oyuna girdi!');
  });

  // Oyundan verdiğin komutları çalıştırır (!/t accept vb.)
  bot.on('chat', (username, message) => {
    if (username === SAHIP_NICK && message.startsWith('!')) {
      const komut = message.substring(1);
      bot.chat(komut);
      console.log(`Bot komut çalıştırdı: ${komut}`);
    }
  });

  bot.on('end', (reason) => {
    console.log(`Bağlantı koptu (${reason}). 10 saniye sonra tekrar bağlanacak...`);
    setTimeout(createBot, 10000);
  });

  bot.on('error', (err) => console.log('Hata oluştu:', err));
}

createBot();
