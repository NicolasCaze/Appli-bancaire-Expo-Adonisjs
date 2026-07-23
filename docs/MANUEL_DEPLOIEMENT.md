# Manuel de déploiement — Finygo

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 24.x (via nvm) |
| npm | 11.x |
| Docker + Docker Compose | pour la base de données locale (recommandé) |
| Expo CLI | `npx expo` (SDK 54) |

---

## 1. Backend (AdonisJS 6)

### 1.1 Démarrer la base de données locale

La façon la plus simple d'obtenir une base PostgreSQL opérationnelle, sans créer de compte externe ni installer PostgreSQL sur sa machine, est d'utiliser Docker Compose :

```bash
cd back-end
docker compose up -d
```

Cette commande démarre un PostgreSQL vide sur `localhost:5433` (port volontairement différent du port standard 5432, pour éviter tout conflit si un PostgreSQL est déjà installé nativement sur la machine), avec les identifiants déjà définis dans `docker-compose.yml` (utilisateur `finygo`, mot de passe `finygo`, base `finygo`). Les données persistent entre les redémarrages grâce au volume Docker.

> **Alternative** : il est possible d'utiliser un projet Supabase (ou tout autre PostgreSQL) à la place — il suffit alors d'adapter `DATABASE_URL` à l'étape suivante avec sa propre chaîne de connexion.

### 1.2 Variables d'environnement

Copier `.env.example` en `.env` dans le dossier `back-end/` :

```bash
cp back-end/.env.example back-end/.env
```

Par défaut, `DATABASE_URL` et les variables `DB_*` pointent déjà vers la base Docker démarrée à l'étape précédente — aucune modification n'est nécessaire pour un usage local. Il reste seulement à générer `APP_KEY` :

```bash
cd back-end && node ace generate:key --force
```

Cette commande remplit automatiquement `APP_KEY` dans le fichier `.env`. Le `--force` est nécessaire pour garantir l'écriture même si la variable d'environnement `NODE_ENV` de votre machine est déjà positionnée sur `production` (dans ce cas, sans `--force`, la commande se contente d'afficher la clé sans l'enregistrer).

### 1.3 Installation des dépendances

```bash
cd back-end
nvm use 24
npm install
```

### 1.4 Migration de la base de données

```bash
cd back-end
nvm use 24
npx prisma migrate deploy
npx prisma generate
```

### 1.5 Démarrage

**Pour tester en local** (recommandé pour cloner et essayer l'application) :

```bash
cd back-end
nvm use 24
npm run dev
```

Le serveur démarre avec rechargement automatique sur `http://localhost:3333`.

**Pour un déploiement en production** :

```bash
cd back-end
nvm use 24
npm run build
node build/bin/server.js
```

Ou avec PM2 :

```bash
npm install -g pm2
pm2 start build/bin/server.js --name finygo-api
pm2 save
pm2 startup
```

---

## 2. Frontend (React Native + Expo)

### 2.1 Variables d'environnement

Copier `.env.example` en `.env` dans le dossier `app-bank/` :

```bash
cp app-bank/.env.example app-bank/.env
```

```env
EXPO_PUBLIC_API_URL=http://<adresse-du-serveur>:3333
```

- **Simulateur/émulateur sur la même machine que le backend** : `http://localhost:3333` fonctionne directement.
- **Application Expo Go sur un téléphone physique** : remplacer par l'adresse IP locale de la machine qui fait tourner le backend (ex. `http://192.168.1.42:3333`), et s'assurer que le téléphone est connecté au **même réseau Wi-Fi**. Pour trouver son IP locale : `ipconfig getifaddr en0` (Mac), `hostname -I` (Linux) ou `ipconfig` (Windows).

### 2.2 Installation des dépendances

```bash
cd app-bank
nvm use 24
npm install
```

### 2.3 Build de production (EAS Build)

**Application Android (APK/AAB) :**

```bash
cd app-bank
npx eas build --platform android --profile production
```

**Application iOS (IPA) :**

```bash
cd app-bank
npx eas build --platform ios --profile production
```

> Nécessite un compte Expo (gratuit) et les certificats de signature correspondants.

### 2.4 Développement local (Expo Go)

```bash
cd app-bank
nvm use 24
npx expo start
```

Scanner le QR code avec l'application Expo Go sur votre téléphone.

---

## 3. Vérification post-déploiement

```bash
# Vérifier que l'API répond
curl http://localhost:3333/health

# Vérifier les tests unitaires
cd back-end && nvm use 24 && npm test
```

---

## 4. Ports utilisés

| Service | Port |
|---------|------|
| Backend AdonisJS | 3333 |
| PostgreSQL (Docker) | 5433 (hôte) → 5432 (conteneur) |
