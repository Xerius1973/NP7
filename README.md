# NP7 — version personnelle avec IA OpenAI

Cette version contient l'interface NP7 V2 et un serveur Node/Express qui appelle l'API OpenAI.

## Lancer sur ton Mac

1. Installe Node.js 20 ou plus récent.
2. Ouvre Terminal dans ce dossier.
3. Lance `npm install`.
4. Copie `.env.example` en `.env`.
5. Mets ta clé API OpenAI dans `OPENAI_API_KEY`.
6. Lance `npm start`.
7. Ouvre `http://localhost:3000`.

La clé API reste côté serveur et n'est pas incluse dans le code de l'application.

## Mise en ligne pour l'iPhone

Le serveur doit être déployé sur un hébergement Node avec HTTPS. Ensuite, ouvre son adresse HTTPS dans Safari et choisis « Ajouter à l'écran d'accueil ».

## Important

Le fichier `.env` ne doit jamais être envoyé sur GitHub ou inclus dans le ZIP public.
