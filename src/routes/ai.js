const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const db = require('../db');

router.post('/assist', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  // If an OpenAI-like key is provided, proxy to the API. Otherwise provide a local fallback.
  if (process.env.OPENAI_API_KEY) {
    try {
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: 'You are an assistant that only provides informational, non-diagnostic health resources and guidance.' }, { role: 'user', content: prompt }],
          max_tokens: 300
        })
      });
      const data = await response.json();
      // Best-effort extraction
      const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || JSON.stringify(data);
      return res.json({ text });
    } catch (err) {
      console.error('AI proxy error', err);
      return res.status(500).json({ error: 'AI proxy failed' });
    }
  }

  // Fallback: suggest resources based on keywords and a brief safe informational reply.
  const q = (prompt || '').toLowerCase();
  const matches = db.findResourcesByQuery(q).slice(0,5);
  let text = 'I can help with informational resources. Here are some suggestions:';
  matches.forEach(m => { text += `\n- ${m.title}: ${m.description}`; });
  if (matches.length === 0) text += '\nNo matching resources found; try different keywords.';
  res.json({ text });
});

module.exports = router;
