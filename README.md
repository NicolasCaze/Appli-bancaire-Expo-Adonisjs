# 📱 Application Bancaire Mobile

Application bancaire complète développée avec React Native (Expo) et AdonisJS, offrant une gestion multi-comptes, des virements, et une authentification sécurisée avec Face ID.

---

## 📖 Vue d'ensemble

Cette application bancaire permet aux utilisateurs de gérer leurs finances personnelles à travers une interface mobile moderne et sécurisée. Elle propose trois types de comptes (Bancaire, Épargne, Pocket), la gestion des transactions, des paiements, et des virements internes/externes.

### Objectifs du projet

- Créer une application bancaire mobile complète et sécurisée
- Implémenter une architecture moderne et scalable
- Maîtriser les technologies full-stack (React Native + AdonisJS)
- Gérer l'authentification et la sécurité des données sensibles

---

## 🛠️ Stack Technologique

### Backend

- **Framework** : AdonisJS 6 (Node.js)
- **ORM** : Prisma
- **Base de données** : PostgreSQL (hébergée sur Supabase)
- **Authentification** : JWT (Access Token + Refresh Token)
- **Sécurité** : Bcrypt pour le hachage des mots de passe
- **API** : RESTful API

### Frontend

- **Framework** : React Native avec Expo SDK 54
- **Routing** : Expo Router (file-based routing)
- **Langage** : TypeScript
- **Gestion d'état** : React Context API
- **Stockage sécurisé** : Expo SecureStore (Keychain iOS / EncryptedSharedPreferences Android)
- **Authentification biométrique** : Face ID / Touch ID
- **UI** : React Native components + Linear Gradient
- **Navigation** : PagerView pour le swipe entre comptes

---

## 📊 Architecture du Projet

### Structure Backend (`/back-end`)

```
back-end/
├── app/
│   ├── controllers/          # Contrôleurs (logique des routes)
│   │   ├── auth_controller.ts
│   │   ├── accounts_controller.ts
│   │   ├── payments_controller.ts
│   │   ├── transactions_controller.ts
│   │   └── users_controller.ts
│   ├── middleware/           # Middlewares personnalisés
│   │   ├── auth_middleware.ts
│   │   └── ...
│   └── service/              # Logique métier
│       ├── account_service.ts
│       ├── payment_service.ts
│       └── transaction_service.ts
├── config/                   # Configuration (CORS, database, etc.)
├── prisma/
│   └── schema.prisma         # Schéma de base de données
├── start/
│   ├── routes.ts             # Définition des routes API
│   └── kernel.ts             # Configuration des middlewares
└── .env                      # Variables d'environnement
```

### Structure Frontend (`/app-bank`)

```
app-bank/
├── app/                      # Routes (Expo Router)
│   ├── (auth)/              # Groupe de routes authentification
│   │   └── login.tsx
│   ├── (tabs)/              # Navigation par onglets
│   │   ├── index.tsx        # Page d'accueil (comptes)
│   │   ├── transfert.tsx    # Page virements
│   │   └── _layout.tsx      # Layout de la TabBar
│   ├── (profile)/           # Pages profil utilisateur
│   │   ├── index.tsx
│   │   ├── personal-info.tsx
│   │   └── bank-details.tsx
│   └── _layout.tsx          # Layout racine
├── components/              # Composants réutilisables
│   ├── home/
│   │   ├── AccountBalance.tsx
│   │   ├── LastPayments.tsx
│   │   ├── Patrimoine.tsx
│   │   └── DepenseGraphique.tsx
│   └── transfert/
│       └── LastTransfert.tsx
├── contexts/
│   └── AuthContext.tsx      # Context global (user, accounts, transactions)
├── services/                # Services API
│   ├── authService.ts
│   ├── accountService.ts
│   ├── paymentService.ts
│   ├── transactionService.ts
│   └── secureStorage.ts
├── types/
│   └── auth.ts              # Types TypeScript
└── constants/
    └── Colors.ts            # Thème de couleurs
```

---

## 🗄️ Schéma de Base de Données

### Modèle de données Prisma

#### **User** (Utilisateur)

```prisma
- id: Int (PK)
- firstname: String
- lastname: String
- email: String (unique)
- dateNaissance: DateTime
- lieuNaissance: String
- adresse: String
- password: String (hashé avec Bcrypt)
- createdAt: DateTime
- updatedAt: DateTime

Relations:
- accounts[] (1-N)
- beneficiaries[] (1-N)
- refreshTokens[] (1-N)
```

#### **Account** (Compte bancaire)

```prisma
- id: Int (PK)
- type: AccountType (BANCAIRE | EPARGNE | POCKET)
- solde: Decimal(12,2)
- label: String
- iban: String (unique, nullable)
- rib: String (unique, nullable)
- createdAt: DateTime
- userId: Int (FK → User)

Relations:
- user (N-1)
- transactionsSource[] (1-N)
- transactionsDestination[] (1-N)
- payments[] (1-N)
```

#### **Transaction** (Virement)

```prisma
- id: Int (PK)
- montant: Decimal(12,2)
- dateTransaction: DateTime
- type: TransactionType (INTERNAL | EXTERNAL)
- libelle: String
- statut: TransactionStatus (EN_ATTENTE | EFFECTUEE | ECHOUÉE)
- compteSourceId: Int (FK → Account, nullable)
- compteDestinationId: Int (FK → Account, nullable)
- beneficiaireId: Int (FK → Beneficiaire, nullable)
- createdAt: DateTime

Relations:
- compteSource (N-1)
- compteDestination (N-1)
- beneficiaire (N-1)
```

#### **Payment** (Paiement par carte)

```prisma
- id: Int (PK)
- montant: Decimal(12,2)
- datePaiement: DateTime
- description: String
- categorie: String (nullable)
- moyenPaiement: PaymentMethod (CB_FISIQUE | CARTE_VIRTUELLE | APPLE_PAY | GOOGLE_PAY | SEPA)
- statut: PaymentStatus (EN_ATTENTE | EFFECTUE | REFUSE | REMBOURSE)
- accountId: Int (FK → Account)
- createdAt: DateTime

Relations:
- account (N-1)
```

#### **Beneficiaire** (Bénéficiaire externe)

```prisma
- id: Int (PK)
- nom: String
- iban: String
- userId: Int (FK → User)
- createdAt: DateTime

Relations:
- user (N-1)
- transactions[] (1-N)
```

#### **RefreshToken** (Gestion des sessions)

```prisma
- id: Int (PK)
- token: String (unique)
- userId: Int (FK → User)
- expireAt: DateTime
- createdAt: DateTime
- lastUsedAt: DateTime
- revokedAt: DateTime (nullable)
- deviceInfo: String (nullable)
- ipAddress: String (nullable)

Relations:
- user (N-1, cascade delete)
```

### Diagramme des relations

```
User (1) ──────< (N) Account
                      │
                      ├──< (N) Payment
                      │
                      └──< (N) Transaction (source/destination)

User (1) ──────< (N) Beneficiaire ──────< (N) Transaction

User (1) ──────< (N) RefreshToken
```

---

## ✨ Fonctionnalités Implémentées

### 🔐 Authentification & Sécurité

#### Backend

- **Login** : Vérification email/password, génération de JWT (access + refresh token)
- **Refresh Token** : Renouvellement automatique de l'access token
- **Logout** : Révocation du refresh token
- **Middleware Auth** : Protection des routes avec vérification JWT
- **Hachage** : Bcrypt pour sécuriser les mots de passe

#### Frontend

- **Face ID / Touch ID** : Authentification biométrique (Expo LocalAuthentication)
- **SecureStore** : Stockage chiffré des tokens et credentials
  - iOS : Keychain (chiffrement matériel)
  - Android : EncryptedSharedPreferences (AES)
- **Auto-refresh** : Intercepteur Axios pour renouveler automatiquement les tokens expirés
- **Session Management** : Gestion de l'expiration de session

### 💰 Gestion des Comptes

#### Types de comptes

1. **BANCAIRE** : Compte principal (1 par utilisateur)
2. **EPARGNE** : Compte d'épargne (optionnel)
3. **POCKET** : Compte de dépenses (optionnel)

#### Fonctionnalités

- **Création de compte** : API pour créer des comptes EPARGNE et POCKET
- **Affichage multi-comptes** : Swipe horizontal entre les comptes (PagerView)
- **Solde en temps réel** : Affichage du solde de chaque compte
- **Indicateur de pagination** : 3 points pour naviguer entre les comptes
- **Création conditionnelle** : Page dédiée si un type de compte n'existe pas

### 📊 Transactions & Paiements

#### Transactions

- **Récupération** : GET `/transactions` - Liste des virements de l'utilisateur
- **Types** :
  - `INTERNAL` : Virement entre comptes de l'utilisateur
  - `EXTERNAL` : Virement vers un bénéficiaire externe
- **Statuts** : EN_ATTENTE, EFFECTUEE, ECHOUÉE

#### Paiements

- **Récupération** : GET `/payments` - Historique des paiements par carte
- **Moyens de paiement** : CB physique, carte virtuelle, Apple Pay, Google Pay, SEPA
- **Affichage** : Derniers paiements avec icônes et montants

### 📱 Interface Utilisateur

#### Design

- **Style Revolut** : Interface moderne avec gradient violet, composants blancs arrondis
- **Gradient de fond** : Dégradé violet (start → middle → end)
- **Composants blancs** : Fond blanc avec `borderRadius: 16`, marges de 16px
- **TabBar** : Fond blanc semi-transparent (85%), icônes violettes actives

#### Pages principales

1. **Home** : Swipe entre comptes, solde, derniers paiements, patrimoine, graphique
2. **Transfert** : Liste des transactions, interface de virement
3. **Profile** : Informations personnelles, coordonnées bancaires, déconnexion

#### Composants clés

- **AccountBalance** : Affichage du solde avec gradient
- **LastPayments** : 3 derniers paiements + bouton "See all"
- **Patrimoine** : Vue d'ensemble du patrimoine total
- **DepenseGraphique** : Graphique des dépenses mensuelles (LineChart)
- **PagerView** : Navigation par swipe entre comptes

---

## 🔄 Flux de Données

### Authentification

```
1. User entre email/password
2. Frontend → POST /auth/login
3. Backend vérifie credentials
4. Backend génère JWT (access + refresh)
5. Backend retourne {user, tokens}
6. Frontend stocke tokens dans SecureStore
7. Frontend charge les données (accounts, payments, transactions)
```

### Récupération des données

```
1. Frontend récupère access token depuis SecureStore
2. Frontend → GET /accounts (avec Authorization: Bearer <token>)
3. Backend vérifie JWT via middleware
4. Backend retourne les comptes de l'utilisateur
5. Frontend met à jour le Context
6. UI se rafraîchit automatiquement
```

### Refresh Token

```
1. Access token expire (détecté par intercepteur Axios)
2. Frontend → POST /auth/refresh (avec refresh token)
3. Backend vérifie refresh token
4. Backend génère nouveau access token
5. Frontend met à jour le token
6. Frontend rejoue la requête initiale
```

---

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 24.x ou supérieur
- PostgreSQL (ou compte Supabase)
- Expo CLI
- npm ou yarn

### Configuration Backend

1. **Installer les dépendances**

```bash
cd back-end
npm install
```

2. **Configurer les variables d'environnement**

```bash
# .env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="votre_secret_jwt"
JWT_REFRESH_SECRET="votre_secret_refresh"
PORT=3333
```

3. **Initialiser la base de données**

```bash
npx prisma generate
npx prisma db push
```

4. **Démarrer le serveur**

```bash
npm run dev
```

Le backend sera accessible sur `http://localhost:3333`

### Configuration Frontend

1. **Installer les dépendances**

```bash
cd app-bank
npm install
```

2. **Configurer l'URL de l'API**

Mettre à jour l'IP dans les services (`services/*.ts`) :

```typescript
const API_URL = "http://VOTRE_IP:3333";
```

3. **Démarrer l'application**

```bash
npx expo start
```

4. **Scanner le QR code** avec Expo Go (iOS/Android)

---

## 🔐 Sécurité

### Backend

- **JWT** : Tokens signés avec secret (HS256)
- **Bcrypt** : Hachage des mots de passe (salt rounds: 10)
- **CORS** : Configuration pour accepter les requêtes du frontend
- **Middleware Auth** : Vérification systématique des tokens sur routes protégées
- **Refresh Token** : Stocké en base avec expiration, révocation possible
- **Validation** : Vérification des données d'entrée

### Frontend

- **SecureStore** : Chiffrement matériel des tokens
  - iOS : Keychain avec chiffrement hardware
  - Android : EncryptedSharedPreferences (AES-256)
- **Biométrie** : Face ID / Touch ID pour authentification rapide
- **Auto-logout** : Déconnexion automatique si session expirée
- **HTTPS** : Communication chiffrée en production

---

## 📈 Évolutions Futures

### Fonctionnalités à implémenter

- ✅ Virements internes et externes
- ⏳ Gestion des bénéficiaires
- ⏳ Historique détaillé des transactions
- ⏳ Notifications push
- ⏳ Catégorisation automatique des dépenses
- ⏳ Budgets et objectifs d'épargne
- ⏳ Export PDF des relevés
- ⏳ Carte bancaire virtuelle
- ⏳ Paiements récurrents

### Améliorations techniques

- Migration vers une architecture microservices
- Ajout de tests unitaires et d'intégration
- CI/CD avec GitHub Actions
- Monitoring et logs (Sentry, LogRocket)
- Cache Redis pour améliorer les performances
- WebSockets pour les notifications en temps réel

---

## 🏗️ Architecture Technique Détaillée

### Pattern Backend (AdonisJS)

#### Controllers

- Gèrent les requêtes HTTP
- Valident les données d'entrée
- Appellent les services métier
- Retournent les réponses formatées

#### Services

- Contiennent la logique métier
- Interagissent avec Prisma (ORM)
- Gèrent les transactions de base de données
- Retournent les données aux controllers

#### Middleware

- **Auth Middleware** : Vérifie le JWT, attache `ctx.user`
- **CORS Middleware** : Gère les requêtes cross-origin
- **Body Parser** : Parse le JSON des requêtes

### Pattern Frontend (React Native)

#### Context API

- **AuthContext** : État global (user, accounts, payments, transactions)
- Méthodes : `login()`, `logout()`, `loadAccounts()`, etc.
- Accessible via `useAuth()` hook

#### Services

- Encapsulent les appels API (Axios)
- Gèrent les headers d'authentification
- Intercepteurs pour auto-refresh des tokens
- Gestion des erreurs centralisée

#### Components

- **Pages** : Composants de route (Expo Router)
- **Components** : Composants réutilisables
- **Layouts** : Structures de navigation

---

## 📝 Routes API

### Authentification

```
POST   /auth/login      - Connexion utilisateur
POST   /auth/refresh    - Renouvellement du token
POST   /auth/logout     - Déconnexion
```

### Comptes

```
GET    /accounts              - Récupérer les comptes (auth)
POST   /accounts/create       - Créer un compte (auth)
```

### Transactions

```
GET    /transactions          - Liste des transactions (auth)
POST   /transactions/virement - Exécuter un virement (auth, à implémenter)
```

### Paiements

```
GET    /payments              - Historique des paiements (auth)
```

### Utilisateurs

```
GET    /users                 - Liste des utilisateurs (auth)
POST   /create_users          - Créer un utilisateur
```

---

## 🎨 Design System

### Couleurs

```typescript
Colors = {
  gradient: {
    start: "#a78bfa", // Violet clair
    middle: "#6d28d9", // Violet foncé
    end: "#0a0a0a", // Noir
  },
  primary: "#6d28d9", // Violet principal
  accent: "#a78bfa", // Violet clair
  text: {
    light: "#fff",
    dark: "#0a0a0a",
  },
};
```

### Composants

- **Fond blanc** : `backgroundColor: 'white'`, `borderRadius: 16`
- **Marges** : `paddingHorizontal: 16`
- **Ombre** : `shadowColor: '#000'`, `shadowOpacity: 0.1`
- **TabBar** : `backgroundColor: 'rgba(255, 255, 255, 0.85)'`

---

## 📚 Technologies Clés Expliquées

### Prisma ORM

- **Avantages** : Type-safety, migrations automatiques, requêtes optimisées
- **Utilisation** : Modélisation de la BDD, génération du client TypeScript
- **Commandes** : `prisma generate`, `prisma db push`, `prisma studio`

### Expo Router

- **File-based routing** : Structure de dossiers = routes de l'app
- **Groupes** : `(tabs)`, `(auth)`, `(profile)` pour organiser les routes
- **Navigation** : `router.push()`, `router.replace()`

### JWT (JSON Web Tokens)

- **Access Token** : Courte durée (15 min), pour authentifier les requêtes
- **Refresh Token** : Longue durée (7 jours), pour renouveler l'access token
- **Structure** : Header.Payload.Signature (signé avec secret)

### React Context API

- **État global** : Partage de données entre composants sans prop drilling
- **Performance** : Re-render uniquement les composants abonnés
- **Utilisation** : `useAuth()` pour accéder au contexte

---

## 🧪 Tests et Qualité

### Backend

- Validation des données avec AdonisJS Validator (à implémenter)
- Tests unitaires des services (à implémenter)
- Tests d'intégration des routes API (à implémenter)

### Frontend

- TypeScript pour la type-safety
- ESLint pour la qualité du code
- Tests des composants avec Jest (à implémenter)

---

## 📦 Dépendances Principales

### Backend

```json
{
  "@adonisjs/core": "^6.x",
  "@adonisjs/auth": "^9.x",
  "@adonisjs/cors": "^2.x",
  "@prisma/client": "^5.x",
  "bcrypt": "^5.x",
  "jsonwebtoken": "^9.x"
}
```

### Frontend

```json
{
  "expo": "~54.0.x",
  "expo-router": "~6.0.x",
  "react-native": "0.76.x",
  "axios": "^1.x",
  "expo-secure-store": "~13.x",
  "expo-local-authentication": "~14.x",
  "react-native-pager-view": "^6.x",
  "expo-linear-gradient": "~14.x"
}
```

---

## 👥 Contributeurs

Projet développé par Nicolas Caze

---

## 📄 Licence

Ce projet est sous licence MIT.

---

## 📞 Contact

Pour toute question ou suggestion concernant ce projet, n'hésitez pas à me contacter.
