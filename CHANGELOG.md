# Changelog — Finygo

Tous les changements notables sont documentés ici.
Format : [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/) — Versioning sémantique [SemVer](https://semver.org/).

---

## [1.4.0] — 2026-07-24

### Ajouté
- Solde de départ de 100 € et bénéficiaire de démonstration créés automatiquement à l'inscription, pour permettre de tester virements et bénéficiaires immédiatement après création d'un compte
- Sélecteur de date natif (iOS / Android) pour la date de naissance (inscription) et les dates des virements programmés, en remplacement des champs texte libres
- Messages de confirmation après l'inscription et après la création d'un virement programmé

### Corrigé
- Bouton d'onglets masqué derrière la barre de navigation système sur Android (prise en compte des zones sécurisées)
- Boutons de l'en-tête de l'écran d'accueil coupés/débordants sur Android (mauvaise source d'import de `SafeAreaView`)
- Ajout d'un bénéficiaire systématiquement rejeté ("Données invalides") : IBAN saisi avec espaces non nettoyé avant validation, et IBAN généré à l'inscription trop court (~12 caractères) pour la validation du formulaire (minimum 15)
- Texte du sélecteur de date illisible (noir sur fond sombre) sur l'écran des virements programmés

### Sécurité
- Suppression de la route `GET /users`, qui exposait sans filtrage l'ensemble des utilisateurs (dont le mot de passe haché) et des comptes (IBAN, RIB, solde) de tous les utilisateurs à tout compte authentifié ; route non utilisée par le frontend
- Retrait du mot de passe haché des logs serveur à la création d'un compte
- Virement entre comptes propres : vérification que le compte destination appartient bien à l'utilisateur (l'API ne vérifiait que le compte source)
- CORS restreint à une liste d'origines explicites (`ALLOWED_ORIGINS`) au lieu de refléter n'importe quelle origine
- Les erreurs serveur inattendues (500) ne renvoient plus le détail interne de l'exception au client (`users`, `auth`, `me`)
- Retrait d'une adresse IP personnelle oubliée dans `app-bank/.env.example`

### Documentation
- Mise à jour de `docs/CAHIER_RECETTES.md` et `docs/SECURITE.md`

---

## [1.3.0] — 2026-07-22

### Ajouté
- Écran profil complet : modification de l'email et du mot de passe, consultation des coordonnées bancaires

### Sécurité
- Politique de mot de passe renforcée : 8 caractères minimum, majuscule, chiffre et caractère spécial (inscription et changement de mot de passe), appliquée côté client et serveur
- Correction d'une fuite mémoire dans le rate limiter (`rate_limit_middleware`) : purge périodique des entrées IP expirées
- Correction d'un bug de désérialisation de la réponse `/auth/refresh` côté client (l'intercepteur Axios lisait une racine de réponse incorrecte, provoquant une perte de session après 15 minutes)
- Limite de sécurité documentée : rate limiting appliqué par IP et non par compte (`docs/SECURITE.md`)

### Accessibilité
- Ajout des `accessibilityLabel`/`accessibilityRole` manquants sur les écrans de connexion et d'inscription
- Annonce vocale des montants et soldes sur les composants restants (`AccountBalance`, `Patrimoine`, `LastTransfert`)

### Documentation
- Mise à jour de `docs/SECURITE.md` et `docs/CAHIER_RECETTES.md`

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
- Graphique des dépenses journalières par compte (`DepenseGraphique`)
- Vue patrimoine multi-comptes (`Patrimoine`)
- Historique des derniers paiements (`LastPayments`)
- Récupération des données utilisateur au démarrage (comptes, transactions, paiements)

### Modifié
- Refactoring du contexte d'authentification (`AuthContext`) avec chargement des données métier
- Navigation par onglets avec Expo Router

---

## [1.0.0] — 2026-01-12

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
