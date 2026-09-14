import express from 'express';

const app = express();
const pushTokens = new Set();

app.use(express.json());

app.post('/api/push/register', (req, res) => {
  const { token } = req.body;

  if (!token || !token.startsWith('ExponentPushToken[')) {
    return res.status(400).json({ error: 'Token inválido' });
  }

  pushTokens.add(token);

  return res.json({
    success: true,
    totalDevices: pushTokens.size,
  });
});

app.post('/api/push/send', async (req, res) => {
  const { token, title, body, url } = req.body;

  const targets = token ? [token] : [...pushTokens];

  if (!targets.length) {
    return res.status(400).json({ error: 'Nenhum dispositivo registrado' });
  }

  const messages = targets.map((target) => ({
    to: target,
    sound: 'default',
    title: title || 'Nova notificação',
    body: body || '',
    data: {
      url: url || '/',
    },
  }));

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  const result = await response.json();

  return res.status(response.ok ? 200 : 502).json(result);
});

app.listen(3333, () => {
  console.log('API em http://localhost:3333');
});
