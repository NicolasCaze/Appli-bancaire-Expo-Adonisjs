# Changelog — Finygo

Tous les changements notables sont documentés ici.
Format : [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) — Versioning sémantique [SemVer](https://semver.org/).

---

## [1.2.0] — 2026-07-02

### Ajouté
- Gestion des bénéficiaires : ajout, suppression (frontend + backend)
- Virements programmés vers un bénéficiaire (UNIQUE, QUOTIDIEN, HEBDOMADAIRE, MENSUEL)
- Écran profil utilisateur et sous-écrans (informations personnelles, coordonnées bancaires)
- Écrans de virement dédiés : entre comptes propres et vers bénéficiaire
- Service API centralisé (Axios) avec intercepteur de refresh token automatique
- Session manager pour la gestion des expirations de session

### Sécurité
- Validation VineJS sur toutes les routes POST (montants, IBAN, libellés, enums)
- Rate limiting in-memory sur `/auth/login` (5 tentatives/min/IP)
- Headers de sécurité HTTP (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection…)
- Exception handler : masque les stack traces et détails internes en production

### Qualité
- Harnais de tests unitaires Vitest : 22 tests couvrant les services de virement, comptes et bénéficiaires
- Pipeline CI GitHub Actions : lint + tests + typecheck + audit (backend et frontend)
- Accessibilité RGAA : `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` sur tous les éléments interactifs

### Documentation
- `docs/CI.md` : protocole d'intégration continue
- `docs/ACCESSIBILITE.md` : référentiel RGAA et mesures appliquées
- `docs/CAHIER_RECETTES.md` : scénarios de test fonctionnels
- `docs/MANUEL_DEPLOIEMENT.md`, `MANUEL_UTILISATION.md`, `MANUEL_MISE_A_JOUR.md`
- `CHANGELOG.md` (ce fichier)

---

## [1.1.0] — 2026-06-20

### Ajouté
- Graphiques de dépenses par catégorie (`DepenseGraphique`)
- Vue patrimoine multi-comptes (`Patrimoine`)
- Historique des derniers paiements (`LastPayments`)
- Récupération des données utilisateur au démarrage (comptes, transactions, paiements)

### Modifié
- Refactoring du contexte d'authentification (`AuthContext`) avec chargement des données métier
- Navigation par onglets avec Expo Router

---

## [1.0.0] — 2025-12-11

### Ajouté
- Authentification JWT : inscription, connexion, déconnexion, refresh token automatique
- Biométrie : Face ID / Touch ID via Expo LocalAuthentication
- Stockage sécurisé des tokens avec Expo SecureStore
- Modèles de données : User, Account (BANCAIRE, ÉPARGNE, POCKET), Transaction, Payment, Beneficiaire, RefreshToken
- Multi-comptes : consultation des soldes, création de comptes par type
- Virements internes entre comptes propres (atomiques, avec protection contre le découvert)
- Virements externes vers bénéficiaires
- Architecture MVC : AdonisJS 6 + Prisma ORM + PostgreSQL (Supabase)
- Frontend React Native + Expo SDK 54 + Expo Router
