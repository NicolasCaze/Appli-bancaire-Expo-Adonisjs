# Finygo

> ⚠️ **Projet fictif à but pédagogique.** Finygo est une application bancaire **de démonstration**, réalisée dans le cadre d'un projet personnel / scolaire (certification "Expert en Développement Logiciel"). Elle **n'a jamais vocation à être mise en production** ni à traiter de fonds ou de données réelles. Certaines exigences réglementaires et de sécurité imposées à une véritable application bancaire (conformité DSP2/PCI-DSS, KYC, agrément ACPR, audit de sécurité externe, etc.) sont hors du périmètre de ce projet, qui se concentre sur la démonstration de compétences techniques (architecture, sécurité applicative de base, accessibilité, tests, CI/CD).

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
npm install
node ace generate:key --force     # génère APP_KEY dans .env
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

#### ⚠️ Configurer l'URL de l'API (`app-bank/.env`) — étape la plus fréquemment source de blocage

La valeur de `EXPO_PUBLIC_API_URL` dépend de **comment vous lancez l'application**. Il n'y a qu'une seule bonne réponse selon votre cas :

| Vous testez avec...                    | Valeur à mettre dans `app-bank/.env`                                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Simulateur iOS** (Mac uniquement)    | `http://localhost:3333`                                                                                                   |
| **Émulateur Android** (Android Studio) | `http://10.0.2.2:3333` — **pas** `localhost` (depuis l'émulateur, `localhost` désigne l'émulateur lui-même, pas votre PC) |
| **Téléphone physique via Expo Go**     | `http://<votre adresse IPv4 locale>:3333` (voir ci-dessous comment la trouver)                                            |

**Trouver son adresse IPv4 locale** (uniquement nécessaire pour un téléphone physique) :

```bash
# Windows
ipconfig
# → chercher "Adresse IPv4" sous l'adaptateur Wi-Fi actif

# macOS
ipconfig getifaddr en0

# Linux
hostname -I
```

**Si vous testez sur un téléphone physique, deux conditions supplémentaires sont indispensables :**

1. Le téléphone doit être connecté au **même réseau Wi-Fi** que l'ordinateur qui fait tourner le backend (pas de 4G/5G, pas de VPN actif sur l'un des deux appareils).
2. Dans `back-end/.env`, la variable `HOST` doit valoir `HOST=0.0.0.0` (déjà la valeur par défaut de `.env.example`) — avec `HOST=localhost`, le serveur refuse toute connexion venant d'un autre appareil que lui-même, même si l'IP et le réseau sont corrects.

**Après toute modification de `.env` (frontend ou backend), il faut redémarrer le serveur concerné** — un changement de `.env` n'est jamais pris en compte à chaud :

```bash
# Backend : Ctrl+C puis relancer
npm run dev

# Frontend : Ctrl+C puis relancer avec le cache vidé
npx expo start -c
```

Le `-c` est important côté frontend : les variables `EXPO_PUBLIC_*` sont injectées dans le bundle JavaScript par Metro au démarrage — sans vider le cache, un redémarrage peut réutiliser un ancien bundle avec l'ancienne valeur.

**Pour vérifier que la connexion fonctionne**, ouvrir `http://<IP ou 10.0.2.2>:3333/health` directement dans le navigateur du téléphone/émulateur : la réponse `{"status":"ok","database":"connected"}` confirme que le réseau est correctement configuré, indépendamment de l'application.

---

## Documentation

Le dossier [`docs/`](./docs) contient la documentation complète du projet : sécurité (OWASP), accessibilité (RGAA), tests unitaires, cahier de recettes, manuels de déploiement/utilisation/mise à jour, et le protocole d'intégration continue. L'historique des versions est dans [`CHANGELOG.md`](./CHANGELOG.md).

---

Projet développé par Nicolas Caze.
