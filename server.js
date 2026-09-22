import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    const profile = req.body?.profile || {};
    if (!message) return res.status(400).json({ error: 'Décris ton repas.' });
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY manquante sur le serveur.' });
    }

    const system = `Tu es NP7 AI, un assistant de suivi nutritionnel personnel en français.
Analyse le repas décrit par l'utilisateur et estime les valeurs nutritionnelles de chaque aliment.
Règles importantes:
- Ne prétends jamais avoir une précision médicale.
- Si une quantité n'est pas donnée, estime une portion réaliste et indique-la clairement.
- Si une marque ou recette précise manque, utilise une estimation standard et signale l'incertitude dans summary.
- Les calories et macros doivent être cohérentes entre elles et plausibles.
- calories est en kcal; protein, carbs et fat sont en grammes.
- Retourne uniquement le JSON demandé.
Profil indicatif: ${profile.age ?? 22} ans, ${profile.sex ?? 'homme'}, ${profile.height ?? 175} cm, ${profile.weight ?? 75} kg, activité ${profile.activity ?? '3-4 séances/semaine'}, objectif ${profile.goal ?? 'recomposition'}.
`;

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
      input: [
        { role: 'system', content: [{ type: 'input_text', text: system }] },
        { role: 'user', content: [{ type: 'input_text', text: message }] }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'meal_analysis',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              summary: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    name: { type: 'string' },
                    quantity: { type: 'string' },
                    calories: { type: 'number' },
                    protein: { type: 'number' },
                    carbs: { type: 'number' },
                    fat: { type: 'number' }
                  },
                  required: ['name','quantity','calories','protein','carbs','fat']
                }
              }
            },
            required: ['summary','items']
          }
        }
      }
    });

    const data = JSON.parse(response.output_text);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible d’analyser le repas pour le moment.' });
  }
});

app.use((_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(port, '0.0.0.0', () => console.log(`NP7 lancé sur 0.0.0.0:${port}`));
