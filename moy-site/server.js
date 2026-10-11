import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage || typeof userMessage !== 'string') {
    return res.status(400).json({ error: 'Пустое сообщение' });
  }

  const systemPrompt = `Ты — ИИ-помощник по истории Великой Отечественной войны с уклоном на Беларусь.
Отвечай кратко, живо, фактами. Тема: партизаны, Хатынь, Брестская крепость, операция "Багратион",
освобождение городов Беларуси (Минск, Мозырь, Гомель, Витебск, Полоцк и др.), дети-герои (Марат Казей),
подполье, гетто, связь поколений. Если вопрос не по теме — мягко верни к теме войны в Беларуси.
Пиши по-русски, дружелюбно, без воды. Длина — 2–4 предложения.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 400,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: 'Ошибка ИИ: ' + errText });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'Не удалось получить ответ.';
    res.json({ answer });

  } catch (err) {
    res.status(500).json({ error: 'Сервер недоступен: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});