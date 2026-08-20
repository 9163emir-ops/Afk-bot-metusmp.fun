const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 10000;
const SAHIP_NICK = 'emir653688643';

// BOTUN ŞİFRESİNİ BURAYA YAZ (Tırnakların arasına)
const BOT_SIFRE = 'SizinSifreniz123'; 
// Oyuna ilk defa kayıt olacaksan false, zaten kayıtlıysa true yap
const IS_REGISTERED = true; 

let chatLogs = [];
let bot = null;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Votex Bot Paneli</title>
      <style>
        body { font-family: sans-serif; background: #121212; color: #fff; padding: 15px; margin: 0; }
        #logs { background: #1e1e1e; height: 350px; overflow-y: auto; padding: 10px; border-radius: 8px; font-family: monospace; font-size: 13px; margin-bottom: 10px; border: 1px solid #333; }
        .form-box { display: flex; gap: 5px; }
        input[type="text"] { flex: 1; padding: 12px; border-radius: 6px; border: 1px solid #444; background: #222; color: #fff; font-size: 14px; }
        button { padding: 12px 18px; border-radius: 6px; border: none; background: #28a745; color: #fff; font-weight: bold; font-size: 14px; }
        .log-line { margin-bottom: 4px; border-bottom: 1px solid #2a2a2a; padding-bottom: 2px; }
      </style>
    </head>
    <body>
      <h3>🤖 Votex Bot Web Paneli</h3>
      <div id="logs">Yükleniyor...</div>
      <form id="chatForm" class="form-box">
        <input type="text" id="msg" placeholder="Komut veya mesaj yazın" required autocomplete="off" />
        <button type="submit">Gönder</button>
      </form>

      <script>
        const form = document.getElementById('chatForm');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const input = document.getElementById('msg');
          const msg = input.value;
          await fetch('/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
          });
          input.value = '';
          loadLogs();
        };

        async function loadLogs() {
          const res = await fetch('/api/logs');
          const data = await res.json();
          const logsDiv = document.getElementById('logs');
          logsDiv.innerHTML = data.map(l => '<div class="log-line">' + l + '</div>').join('');
          logsDiv.scrollTop = logsDiv.scrollHeight;
        }

        setInterval(loadLogs, 2000);
        loadLogs();
      </script>
    </body>
    </html>
  `);
});

app.get('/api/logs', (req, res) => res.json(chatLogs));

app.post('/send', (req, res) => {
  const { message } = req.body;
  if (message && bot) {
    bot.chat(message);
    chatLogs.push(`<b>[SEN WEB'DEN]:</b> ${message}`);
    if (chatLogs.length > 100) chatLogs.shift();
  }
  res.json({ status: 'ok' });
});

// 0.0.0.0 dinleyicisi Render'ın 503 hatasını çözer
app.listen(PORT, '0.0.0.0', () => console.log(`Web sunucu ${PORT} portunda aktif.`));

function addLog(text) {
  console.log(text);
  chatLogs.push(text);
  if (chatLogs.length > 100) chatLogs.shift();
}

function createBot() {
  bot = mineflayer.createBot({
    host: 'metusmp.fun',
    port: 25565,
    username: 'votex',
    version: '1.21.11'
  });

  bot.on('spawn', () => {
    addLog('<b>🟢 Bot oyuna girdi!</b>');
    
    // Oyuna girer girmez 2 saniye sonra otomatik giriş komutu atar
    setTimeout(() => {
      if (IS_REGISTERED) {
        bot.chat(`/login ${BOT_SIFRE}`);
        addLog('<b>[OTOMATİK]:</b> /login komutu gönderildi.');
      } else {
        bot.chat(`/register ${BOT_SIFRE} ${BOT_SIFRE}`);
        addLog('<b>[OTOMATİK]:</b> /register komutu gönderildi.');
      }
    }, 2000);
  });

  bot.on('message', (jsonMsg) => {
    addLog(jsonMsg.toAnsi());
  });

  bot.on('chat', (username, message) => {
    if (username === SAHIP_NICK && message.startsWith('!')) {
      const komut = message.substring(1);
      bot.chat(komut);
      addLog(`<b>[KOMUT UYGULANDI]:</b> ${komut}`);
    }
  });

  bot.on('end', (reason) => {
    addLog(`🔴 Bağlantı koptu (${reason}). 10sn sonra tekrar bağlanacak...`);
    setTimeout(createBot, 10000);
  });

  bot.on('error', (err) => addLog(`⚠️ Hata: ${err.message}`));
}

createBot();
