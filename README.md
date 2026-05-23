# 🚴 BRouter Mobile PWA

Planificateur de routes vélo avec BRouter - Installable sur smartphone comme une app native !

## 🚀 Démarrage rapide

### 1️⃣ Installation locale

```bash
# Installe les dépendances
npm install

# Lance en développement
npm run dev
```

Ouvre `http://localhost:5173` dans le navigateur.

### 2️⃣ Test sur smartphone (même WiFi)

**Android (Chrome)**
```
1. Sur smartphone : ouvre Chrome
2. Va à http://[IP-DU-PC]:5173
3. Attends 10s que le Service Worker charge
4. Menu → "Installer l'app"
```

**iOS (Safari)**
```
1. Sur iPhone : ouvre Safari
2. Va à http://[IP-DU-PC]:5173
3. Partage → "Sur l'écran d'accueil"
```

### 3️⃣ Déploiement sur Vercel (gratuit)

```bash
# Build pour production
npm run build

# Déploie sur Vercel (avec GitHub)
git push origin main
```

Vercel redéploiera automatiquement à chaque push !

## 📱 Fonctionnalités

✅ **Configuration vélo** : 6 profils pré-enregistrés + personnalisés  
✅ **Carte interactive** : OSM + surcouche vélo (Thunderforest Cycle)  
✅ **Routage BRouter** : Intégration API publique  
✅ **Export GPX** : Compatible Komoot, RideWithGPS, Garmin  
✅ **Offline-first** : Cache intelligent des tuiles + routes  
✅ **Stockage local** : Persistance localStorage  

## 🎯 Workflow

1. **Config** : Choisis ou crée ton vélo
2. **Carte** : Click pour ajouter waypoints
3. **Routage** : Clique "Calculer route"
4. **Export** : Exporte en GPX

## 📂 Structure

```
brouter-pwa/
├── src/
│   ├── BRouterApp.jsx      # Composant principal
│   ├── main.jsx            # Entry point
│   └── index.css           # Styles
├── public/
│   └── manifest.json       # Manifeste PWA
├── index.html              # HTML
├── vite.config.js          # Configuration Vite
└── package.json            # Dépendances
```

## 🔧 Build pour production

```bash
npm run build
```

Cela crée un dossier `dist/` optimisé et prêt à déployer.

## 📞 Support

- Chrome DevTools → Application → Manifest
- Vérifier HTTPS en production
- Service Worker doit charger (~10s)

## 🚀 Prochaines étapes

1. **Crée les icônes** : https://www.pwabuilder.com/imageGenerator
2. **Déploie sur Vercel** : Connecte ton repo GitHub
3. **Installe sur smartphone** : Ouvre le lien Vercel → Menu → Installer

Good luck ! 🚴‍♂️
