# 🚴 BRouter Mobile PWA

Planificateur de routes vélo avec BRouter - Installable sur smartphone !

## 🚀 Installation

```bash
npm install
npm run dev
```

Ouvre `http://localhost:5173`

## 📦 Structure (100% Vite compatible)

```
brouter-final/
├── index.html          ← À LA RACINE (obligatoire)
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx        ← Entry point
│   ├── BRouterApp.jsx
│   └── index.css
└── public/
    └── manifest.json
```

## 🚀 Déployer sur Vercel

```bash
npm run build
git push origin main
```

Vercel redéploiera auto !

## 📱 Installer sur smartphone

- Ouvre le lien Vercel sur ton téléphone
- Menu → "Installer l'app"
- ✅ C'est installé !

## 🔥 Features

✅ Configuration vélo (6 profils)
✅ Routage BRouter API
✅ Carte interactive (OSM + vélo)
✅ Export GPX
✅ Offline-first
✅ PWA installable
