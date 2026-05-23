# 🚴 BRouter PWA - Guide d'installation et déploiement

## 📋 Structure du projet

```
brouter-pwa/
├── src/
│   ├── BRouterApp.jsx          # Composant principal
│   ├── main.jsx                 # Entry point
│   └── index.css                # Styles globaux
├── public/
│   ├── manifest.json            # Manifest PWA
│   ├── sw.ts                    # Service Worker
│   ├── icon-192.png            # Icône 192x192
│   ├── icon-512.png            # Icône 512x512
│   └── apple-touch-icon.png    # Icône iOS
├── index.html                   # HTML principal
├── vite.config.js              # Configuration Vite + PWA
├── package.json                # Dépendances
└── .gitignore
```

---

## 🔧 Installation locale

### 1. Cloner ou créer le projet

```bash
npm create vite@latest brouter-pwa -- --template react
cd brouter-pwa
```

### 2. Installer les dépendances

```bash
npm install leaflet vite-plugin-pwa
```

### 3. Placer les fichiers

- Remplacer `vite.config.js` par le fichier fourni
- Remplacer `index.html` par le fichier fourni
- Placer `BRouterApp.jsx` dans `src/`
- Remplacer `src/main.jsx` par le fichier fourni
- Remplacer `src/index.css` par le fichier fourni

### 4. Créer le dossier `public/`

```bash
mkdir -p public
```

Placer les fichiers PWA dedans (manifest.json, sw.ts, icônes).

### 5. Lancer en développement

```bash
npm run dev
```

Ouvre `http://localhost:5173` dans le navigateur.

---

## 📱 Installer sur smartphone (local)

### Android

1. Lance `npm run dev`
2. Sur smartphone sur le **même WiFi** :
   - Ouvre Chrome
   - Navigue vers `http://[IP-DU-PC]:5173`
   - Attends que le Service Worker se charge (~10s)
   - Clique le menu → **"Installer l'app"**
   - L'app apparaît sur l'écran d'accueil !

### iOS (iPhone/iPad)

1. Lance `npm run dev`
2. Sur iPhone sur le **même WiFi** :
   - Ouvre Safari
   - Navigue vers `http://[IP-DU-PC]:5173`
   - Clique le bouton **Partage** (en bas)
   - Sélectionne **"Sur l'écran d'accueil"**
   - Donne un nom (ex: "BRouter")
   - L'app s'ajoute à l'écran d'accueil !

---

## 🚀 Déploiement en production (gratuit)

### Option A : Vercel (RECOMMANDÉ)

**Avantages** : Déploiement automatique, HTTPS gratuit, très simple

#### Étapes :

1. **Crée un compte gratuit** : https://vercel.com

2. **Pousse le code sur GitHub** :
   ```bash
   git init
   git add .
   git commit -m "Initial commit BRouter PWA"
   git branch -M main
   git remote add origin https://github.com/TON_USERNAME/brouter-pwa.git
   git push -u origin main
   ```

3. **Sur Vercel** :
   - Clique "New Project"
   - Sélectionne ton repo GitHub
   - Clique "Deploy"
   - **C'est tout !** Vercel gère le build auto

4. **Ton app sera à** : `https://brouter-pwa-xxxxx.vercel.app`

5. **Sur smartphone** :
   - Ouvre le lien
   - Clique "Installer l'app"
   - C'est installé !

---

### Option B : Netlify

**Avantages** : Gratuit, HTTPS, simple

#### Étapes :

1. Crée compte : https://netlify.com
2. Connecte ton repo GitHub
3. Clique "Deploy"
4. Ton app sera à : `https://brouter-pwa-xxxxx.netlify.app`

---

### Option C : GitHub Pages

**Avantages** : Ultra gratuit, intégré à GitHub

#### Étapes :

1. **Crée repo** `brouter-pwa` sur GitHub
2. **Modifie `vite.config.js`** :
   ```js
   export default {
     base: '/brouter-pwa/', // Important !
     // ... reste de la config
   }
   ```

3. **Ajoute à `package.json`** :
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

4. **Installe `gh-pages`** :
   ```bash
   npm install -D gh-pages
   ```

5. **Déploie** :
   ```bash
   npm run deploy
   ```

6. **Active Pages** : GitHub → Settings → Pages → Source "gh-pages"

7. Ton app sera à : `https://TON_USERNAME.github.io/brouter-pwa`

---

## 📥 Créer les icônes PWA

Tu as besoin de 4 icônes (place-les dans `public/`) :

### Option 1 : Générer automatiquement

Utilise : https://www.pwabuilder.com/imageGenerator

1. Télécharge une image 512x512 de ton logo
2. Clique "Generate"
3. Télécharge les icônes
4. Place dans `public/`

### Option 2 : Crée une simple image

Une simple image 512x512 suffira (ex: logo BRouter en bleu).

**Noms requis** :
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `icon-192-maskable.png` (192x192, peut être recadrée)
- `icon-512-maskable.png` (512x512, peut être recadrée)
- `apple-touch-icon.png` (180x180, pour iOS)

---

## 🔒 Considérations de sécurité

- ✅ **HTTPS obligatoire** en production (Vercel/Netlify le font auto)
- ✅ **Offline-first** : les cartes/routes sont cachées localement
- ✅ **Données locales** : tout dans localStorage du téléphone
- ✅ **Service Worker** : met à jour auto l'app quand tu déploies

---

## 📊 Tester la PWA

### Chrome DevTools

1. Ouvre DevTools (F12)
2. Onglet **Application** → **Manifest**
3. Vérifie que tout est vert ✅

### Lighthouse

1. DevTools → **Lighthouse**
2. Clique "Generate report"
3. Tu dois avoir ~90+ pour PWA installable

---

## 🐛 Dépannage

### L'app ne s'installe pas

- ✅ Vérifie **HTTPS** (pas de http://localhost en prod)
- ✅ Vérifie que le **manifest.json** est valide
- ✅ Attends 10-15s que le Service Worker se charge
- ✅ Actualise la page (Ctrl+Shift+R)

### Les cartes ne chargent pas offline

- Le cache des tuiles nécessite une première visite
- Visite la carte une fois en ligne
- Puis tu peux l'utiliser offline

### Erreur Service Worker

```bash
# Vider le cache
npm run build
# Et redéployer
```

---

## 📈 Statistiques PWA

- **Taille app** : ~2 MB (gzipée)
- **Temps démarrage** : <1s une fois en cache
- **Cache tuiles** : jusqu'à 300 MB local (configurable)
- **Offline** : Fonctionne sans internet (sauf routage BRouter)

---

## 🎯 Prochaines étapes

1. **Déploie sur Vercel** (5 min)
2. **Teste sur smartphone** (2 min)
3. **Partage le lien** à tes copains cyclistes ! 🚴‍♂️

---

## 📞 Support

Besoin d'aide ?
- Chrome DevTools → Application → Manifest
- Vérifier HTTPS
- Vérifier que manifest.json existe et est valide

Good luck ! 🚀
