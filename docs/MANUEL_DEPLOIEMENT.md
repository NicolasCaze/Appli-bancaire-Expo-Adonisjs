# Manuel de déploiement — Finygo

## Prérequis

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 24.x (via nvm) |
| npm | 11.x |
| PostgreSQL | 15+ (ou compte Supabase) |
| Expo CLI | `npx expo` (SDK 54) |

---

## 1. Backend (AdonisJS 6)

### 1.1 Variables d'environnement

Copier `.env.example` en `.env` dans le dossier `back-end/` :

```bash
cp back-end/.env.example back-end/.env
```

Renseigner les variables suivantes :

```env
# Base de données
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"

# JWT
APP_KEY=<clé aléatoire 32 caractères>

# Environnement
NODE_ENV=production
PORT=3333
HOST=0.0.0.0
```

Pour générer `APP_KEY` :

```bash
cd back-end && node ace generate:key
```

### 1.2 Installation des dépendances

```bash
cd back-end
nvm use 24
npm install
```

### 1.3 Migration de la base de données

```bash
cd back-end
nvm use 24
npx prisma migrate deploy
npx prisma generate
```

### 1.4 Démarrage en production

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

Créer `app-bank/.env` :

```env
EXPO_PUBLIC_API_URL=http://<adresse-du-serveur>:3333
```

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
| PostgreSQL | 5432 |
