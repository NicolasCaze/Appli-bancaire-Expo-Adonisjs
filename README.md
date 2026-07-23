# Finygo

Application bancaire mobile (néobanque) développée avec **React Native / Expo** (frontend) et **AdonisJS 6 / Prisma / PostgreSQL** (backend).

Gestion multi-comptes (Bancaire, Épargne, Pocket), virements internes et externes, virements programmés, bénéficiaires, budget mensuel avec alertes, authentification par mot de passe ou biométrie (Face ID / Touch ID).

---

## Lancer l'application en local

### Prérequis

- [Node.js 24](https://nodejs.org/) (idéalement via [nvm](https://github.com/nvm-sh/nvm))
- [Docker + Docker Compose](https://docs.docker.com/get-docker/) (pour la base de données)
- L'application [Expo Go](https://expo.dev/go) sur un téléphone, ou un simulateur iOS/émulateur Android

### 1. Backend

```bash
cd back-end
docker compose up -d              # démarre une base PostgreSQL locale
cp .env.example .env
node ace generate:key --force     # génère APP_KEY dans .env
npm install
npx prisma migrate deploy         # crée les tables
npx prisma generate
npm run dev
```

Vérifier que tout fonctionne :

```bash
curl http://localhost:3333/health
# → {"status":"ok","database":"connected"}
```

### 2. Frontend

```bash
cd app-bank
cp .env.example .env
npm install
npx expo start
```

Puis scanner le QR code avec l'application **Expo Go**, ou appuyer sur `i` (simulateur iOS) / `a` (émulateur Android).

> **URL de l'API** (`app-bank/.env`) : `http://localhost:3333` fonctionne directement avec un simulateur sur la même machine. Avec Expo Go sur un téléphone physique, remplacer par l'adresse IP locale de la machine qui fait tourner le backend (le téléphone doit être sur le même réseau Wi-Fi).

---

## Documentation

Le dossier [`docs/`](./docs) contient la documentation complète du projet : sécurité (OWASP), accessibilité (RGAA), tests unitaires, cahier de recettes, manuels de déploiement/utilisation/mise à jour, et le protocole d'intégration continue. L'historique des versions est dans [`CHANGELOG.md`](./CHANGELOG.md).

---

Projet développé par Nicolas Caze.
