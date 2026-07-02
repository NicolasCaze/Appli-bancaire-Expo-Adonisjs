# SPECS BLOC 2 — Finygo (application bancaire) : Mise en conformité certification "Expert en Développement Logiciel"

## Contexte

Finygo est une application bancaire mobile type néobanque (React Native + Expo SDK 54, AdonisJS 6 + Prisma, PostgreSQL/Supabase).
**Le projet reste une application bancaire** — pas de pivot. Ignorer tout éventuel fichier MIGRATION_SPECS.md présent dans le projet.

Ce document liste les travaux à réaliser pour couvrir les exigences du Bloc 2 de la certification, notamment les compétences éliminatoires :

- C2.2.1 — Prototype fonctionnel et ergonomique
- C2.2.2 — Harnais de tests unitaires
- C2.2.3 — Sécurisation du code + accessibilité
- C2.3.1 — Cahier de recettes

## État actuel du projet (ne pas modifier)

- Authentification : JWT + refresh token + biométrie (Face ID / Touch ID) + SecureStore
- Modèles : User, Account (Bancaire, Épargne, Pocket), Transaction, Payment, Beneficiaire, RefreshToken
- Fonctionnalités : multi-comptes, virements internes entre comptes, virements externes vers bénéficiaires, historique, graphiques de dépenses, budget par catégorie
- Architecture : API RESTful, pattern MVC, Expo Router, Auth Context, Prisma ORM

---

## 1. TESTS UNITAIRES (éliminatoire C2.2.2)

Créer un harnais de tests Jest couvrant **la fonctionnalité de virement** (interne et externe) de bout en bout côté backend.

### Tests à implémenter (minimum)

1. **Virement interne valide** : le solde du compte source est débité ET le solde du compte cible est crédité du même montant.
2. **Atomicité** : si le crédit du compte cible échoue, le débit de la source est annulé (rollback — transaction SQL).
3. **Montant invalide** : montant négatif ou nul → rejet avec erreur explicite, aucun solde modifié.
4. **Solde insuffisant** : virement supérieur au solde du compte source → rejet (pas de découvert autorisé en V1 — documenter ce choix).
5. **Compte inexistant** : source ou cible introuvable → erreur 404, aucun solde modifié.
6. **Virement vers soi-même** : compte source = compte cible → rejet.
7. **Isolation utilisateur** : un utilisateur ne peut pas virer depuis le compte d'un autre utilisateur → erreur 403.
8. **Virement externe valide** : le compte source est débité, la transaction est enregistrée avec le bénéficiaire associé.
9. **Bénéficiaire inexistant** : virement externe vers un bénéficiaire introuvable ou n'appartenant pas à l'utilisateur → rejet.

### Consignes techniques

- Utiliser Jest (déjà présent dans le projet) avec une base de test isolée ou des mocks Prisma.
- Viser une couverture significative (le référentiel demande que "les tests unitaires couvrent la majorité du code développé" — prioriser les services et controllers de virement, puis étendre à la gestion des comptes et bénéficiaires si le temps le permet).
- Ajouter les scripts `npm run test` et `npm run test:coverage` dans le package.json backend.

---

## 2. INTÉGRATION CONTINUE (protocole CI — C2.1.2)

Créer un workflow **GitHub Actions** : `.github/workflows/ci.yml`

### Pipeline à chaque push / pull request

1. Checkout du code
2. Installation des dépendances (backend et frontend)
3. Lint (ESLint) sur backend et frontend
4. Exécution des tests Jest backend
5. Build de vérification (tsc --noEmit pour vérifier le typage TypeScript)

### Consignes

- Le pipeline doit échouer si le lint ou les tests échouent.
- Documenter le protocole dans `docs/CI.md` : déclencheurs, étapes, séquences d'intégration.

---

## 3. SÉCURITÉ OWASP (éliminatoire C2.2.3)

L'app dispose déjà de : JWT + refresh token, Bcrypt, SecureStore, SSL (Supabase), CORS.
Compléter pour couvrir le Top 10 OWASP — d'autant plus critique pour une application bancaire :

### À implémenter

1. **Validation des entrées** : utiliser VineJS (validateur natif AdonisJS 6) sur TOUTES les routes acceptant un body — montants (nombre positif, 2 décimales max), libellés (longueur max), IBAN des bénéficiaires (format valide), dates.
2. **Rate limiting** : limiter les tentatives sur `/auth/login` (ex : 5 tentatives / minute / IP) via le middleware AdonisJS de rate limiting. Envisager aussi une limite sur la création de virements (anti-abus).
3. **Gestion des erreurs sans fuite** : les réponses d'erreur en production ne doivent jamais exposer de stack trace, de requête SQL ou de détail interne. Vérifier le handler d'exceptions global.
4. **Headers de sécurité** : vérifier/activer les headers via le middleware (X-Content-Type-Options, X-Frame-Options...).
5. **Audit des dépendances** : ajouter `npm audit` dans le pipeline CI (non bloquant mais visible) — pertinent vu les attaques supply chain NPM ayant visé des banques en 2023.

### Documentation

Créer `docs/SECURITE.md` listant chaque faille du OWASP Top 10 (édition récente) avec, pour chacune, la mesure mise en place dans Finygo (ou la justification de non-applicabilité). Ce document servira directement au dossier écrit.

---

## 4. ACCESSIBILITÉ (éliminatoire C2.2.3)

Référentiel retenu : **RGAA** (Référentiel Général d'Amélioration de l'Accessibilité — référentiel officiel français).

### À implémenter côté frontend

1. Ajouter `accessibilityLabel`, `accessibilityRole` et `accessibilityHint` (si pertinent) sur **tous les éléments interactifs** : boutons, champs de saisie, onglets, éléments de liste cliquables.
2. Vérifier les **contrastes** texte/fond des écrans principaux (ratio 4.5:1 minimum pour le texte normal).
3. S'assurer que les montants et soldes sont annoncés de façon compréhensible par les lecteurs d'écran (ex : "Solde : 250 euros" et non "250").
4. Tailles de zones tactiles ≥ 44x44 points pour les boutons.

### Documentation

Créer `docs/ACCESSIBILITE.md` : référentiel choisi (RGAA) et justification, liste des actions mises en œuvre, exemples de code (composant avant/après).

---

## 5. VERSIONING & HISTORIQUE (C2.2.4)

1. Créer un `CHANGELOG.md` à la racine suivant le format "Keep a Changelog" avec versioning sémantique :
   - `1.0.0` — MVP initial (auth, comptes, virements)
   - `1.1.0` — graphiques et budget par catégorie
   - `1.2.0` — fonctionnalités Bloc 2 (récurrences, alertes)
     Adapter les versions à l'historique Git réel du projet si possible.
2. Créer les tags Git correspondants.
3. Documenter la convention de commit et de versioning dans le README.

---

## 6. NOUVELLES FONCTIONNALITÉS

### 6.1 Virements récurrents / paiements programmés

Permettre à l'utilisateur de planifier des opérations qui se répètent (ex : loyer mensuel vers un bénéficiaire, virement d'épargne automatique).

**Backend**

- Modèle `RecurringPayment` : type (virement interne / virement externe), montant, libellé, compte source, cible (compte ou bénéficiaire), fréquence (mensuelle pour commencer), jour du mois, actif/inactif. S'appuyer sur le modèle `Payment` existant s'il couvre déjà partiellement ce besoin.
- CRUD : `GET/POST/PUT/DELETE /recurring-payments`.
- Mécanisme d'application : à la connexion de l'utilisateur (ou via une commande AdonisJS planifiable), générer les virements dus depuis la dernière application. Choix simple et testable ; documenter la limite (pas de vrai cron en V1).

**Frontend**

- Écran de gestion des virements récurrents : liste, création, modification, activation/désactivation.
- Badge/icône distinctif sur les transactions générées automatiquement dans l'historique.

### 6.2 Alertes de dépassement de budget

Les plafonds mensuels par catégorie existent déjà. Ajouter la couche d'alerte :

**Backend**

- À la création d'une dépense/paiement, calculer le cumul du mois pour la catégorie et retourner dans la réponse un statut budget : `ok` (< 80%), `warning` (80–100%), `exceeded` (> 100%).

**Frontend**

- Barre de progression par catégorie sur l'écran Budget : vert < 80%, orange 80–100%, rouge > 100%.
- Bannière/toast d'avertissement à la saisie d'une opération qui fait passer la catégorie en warning ou exceeded.
- Respecter l'accessibilité : l'état ne doit pas reposer que sur la couleur (ajouter texte/icône).

---

## 7. CAHIER DE RECETTES (éliminatoire C2.3.1)

Créer `docs/CAHIER_RECETTES.md` : tableau de scénarios de test fonctionnels couvrant l'ensemble des fonctionnalités.

Format par scénario : ID, fonctionnalité, prérequis, étapes, résultat attendu, résultat obtenu (colonne à remplir manuellement), statut (OK/KO).

Couvrir au minimum : inscription, connexion (mot de passe + biométrie), consultation des comptes et soldes, virement interne (cas nominal + cas d'erreur : solde insuffisant, montant invalide), gestion des bénéficiaires (ajout, modification, suppression), virement externe, virements récurrents, alertes de budget, consultation historique et graphiques, modification du profil, déconnexion.

Ajouter également un `docs/PLAN_CORRECTION_BOGUES.md` (modèle) : processus de détection → qualification (criticité) → correction → vérification.

---

## 8. MANUELS (C2.4.1)

Créer trois documents dans `docs/` :

1. `MANUEL_DEPLOIEMENT.md` — prérequis (Node, npm, compte Supabase, Expo), variables d'environnement, étapes backend (install, migration Prisma, lancement), étapes frontend (install, expo start), déploiement build EAS.
2. `MANUEL_UTILISATION.md` — parcours utilisateur écran par écran avec les fonctionnalités principales.
3. `MANUEL_MISE_A_JOUR.md` — procédure de mise à jour des dépendances, application des migrations, montée de version.

---

## Ordre de travail recommandé

1. Fonctionnalités (6.1 puis 6.2) — le code d'abord
2. Sécurité (3) — validation, rate limiting, erreurs
3. Accessibilité (4)
4. Tests unitaires (1) — sur le code stabilisé
5. CI (2)
6. Versioning (5)
7. Documentation : cahier de recettes (7) puis manuels (8)

## Instructions pour Claude Code

- Explore le projet avant toute modification.
- **Le projet reste une application bancaire** : conserver les modèles Account, Beneficiaire, les virements internes ET externes. N'applique aucun renommage type "enveloppe".
- Travaille par étape et vérifie que le projet compile et que les tests passent entre chaque grande étape.
- Chaque document produit dans `docs/` doit être rédigé en français, clair et directement exploitable pour le dossier écrit de certification (30 pages max au total — rester concis).
- Signale toute ambiguïté plutôt que de trancher silencieusement.
- Ne modifie pas l'authentification existante (JWT, biométrie, SecureStore) sauf pour ajouter le rate limiting sur le login.
