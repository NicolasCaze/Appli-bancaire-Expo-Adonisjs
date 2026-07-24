# Tests unitaires — Finygo

## Objectif et périmètre

Le référentiel de certification (compétence éliminatoire C2.2.2) exige que "les tests unitaires couvrent la majorité du code développé". Ce document synthétise la stratégie de test mise en place et les chiffres de couverture réels, mesurés à la fois côté backend et côté frontend.

Deux harnais de tests indépendants, un par application :

| | Backend (AdonisJS) | Frontend (Expo / React Native) |
|---|---|---|
| Outil | Vitest | Jest + `jest-expo` |
| Commande | `npm test` / `npm run test:coverage` | `npm test` / `npm run test:coverage` |
| Tests | 89 | 125 |
| Fichiers de test | 11 | 13 |
| Couverture mesurée | 93,8 % (services + middlewares) | 99,3 % (services + utilitaires) |

Les deux suites sont exécutées automatiquement à chaque push et pull request par le pipeline CI (`.github/workflows/ci.yml`), et bloquent le merge en cas d'échec (voir `docs/CI.md`).

---

## Backend — 89 tests, 93,8 % de couverture

### Pourquoi cibler les services et les middlewares

La logique métier de l'application (calculs, règles de gestion, sécurité, atomicité des virements) est concentrée dans la couche `app/service/` et dans les `app/middleware/` d'authentification. Les contrôleurs (`app/controllers/`) sont volontairement fins : ils valident l'entrée (VineJS) puis délèguent à un service — leur logique propre est donc déjà exercée indirectement par les tests de service. C'est pourquoi l'effort de test s'est concentré sur ces deux couches, qui concentrent l'essentiel de la valeur et du risque.

### Détail par fichier

| Fichier | Rôle | Couverture |
|---|---|---|
| `auth_service.ts` | Login, refresh token (rotation + détection de réutilisation), logout, limitation des sessions actives | 100 % |
| `users_service.ts` | Inscription : création atomique user + compte + bénéficiaire de démo | 100 % |
| `me_service.ts` | Profil, changement d'email, changement de mot de passe | 96 % |
| `payment_service.ts` | Historique des paiements | 100 % |
| `account_service.ts` | Consultation et création de comptes | 91 % |
| `beneficiaire_service.ts` | CRUD bénéficiaires | 100 % |
| `transaction_service.ts` | Virement interne et externe (débit/crédit atomique, contrôle d'accès) | 95 % |
| `virement_programme_service.ts` | Virements programmés : création, annulation, moteur d'exécution des échéances | 96 % |
| `auth_middleware.ts` | Vérification JWT sur les routes protégées | 100 % |
| `rate_limit_middleware.ts` | Anti brute-force sur `/auth/login` (5 tentatives/minute) | 78 % |
| `security_headers_middleware.ts` | En-têtes de sécurité HTTP | 100 % |

Les quelques pourcentages sous 100 % correspondent à des branches marginales (ex. purge périodique du rate limiter, qui tourne en tâche de fond et n'est pas déclenchable depuis un test unitaire classique).

### Scénarios couverts (extraits représentatifs)

- **Virement interne** : cas nominal (débit + crédit), atomicité en cas d'échec, montant invalide, solde insuffisant, compte source/destination introuvable, virement vers soi-même, **isolation utilisateur dans les deux sens** (le compte source *et* le compte destination doivent appartenir à l'utilisateur — correctif de sécurité de cette itération, testé explicitement)
- **Virement externe** : mêmes contrôles côté bénéficiaire (introuvable, appartenance)
- **Authentification** : identifiants invalides, rotation du refresh token, **détection de réutilisation d'un token révoqué avec révocation en cascade de toutes les sessions actives**, limitation à 5 sessions actives
- **Virements programmés** : validation des dates, fréquences (unique/quotidien/hebdomadaire/mensuel), moteur d'exécution des échéances dues (y compris le cas d'un solde insuffisant, qui laisse le virement actif pour retry)
- **Inscription** : génération d'un IBAN de 27 caractères (correctif du bug bloquant l'ajout d'un compte comme bénéficiaire), solde de départ de 100 €

---

## Frontend — 125 tests, 99,3 % de couverture

### Pourquoi cibler les services plutôt que les composants

L'application ne disposait d'aucun outillage de test avant cette itération. Face à ce constat, le choix a été de prioriser la couche `services/` et `utils/` : c'est elle qui contient toute la logique non-triviale (gestion des tokens, rafraîchissement automatique de session, règles de calcul du budget, mapping des erreurs serveur) et qui présente le plus de risque de régression silencieuse. Les écrans (`app/`) restent couverts par les scénarios fonctionnels du `docs/CAHIER_RECETTES.md`, rejoués manuellement à chaque campagne de recette.

### Mise en place

- `jest` + `jest-expo` (preset officiel Expo, gère automatiquement le mock des modules natifs)
- `babel-preset-expo` pour la transformation TypeScript/JSX
- Scripts `npm test` et `npm run test:coverage` ajoutés à `package.json`
- Intégré au pipeline CI au même titre que le lint et le typecheck

### Détail par fichier

| Fichier | Rôle | Couverture |
|---|---|---|
| `api.ts` | Instance Axios centrale : injection du token, **intercepteur de rafraîchissement automatique sur 401** (rejeu de la requête originale, déconnexion si le refresh échoue) | 100 % |
| `authService.ts` | Login, logout, vérification de session | 100 % |
| `secureStorage.ts` | Wrapper `expo-secure-store` : tokens, préférence biométrique, credentials, profil utilisateur | 98,5 % |
| `biometricAuth.ts` | Détection et déclenchement Face ID / Touch ID / empreinte | 100 % |
| `budgetNotificationService.ts` | Calcul du cumul mensuel de dépenses, seuils d'alerte (80 % / 100 %), notifications programmées | 100 % |
| `accountService.ts`, `meService.ts`, `paymentService.ts`, `transactionService.ts`, `virementProgrammeService.ts`, `beneficiaireService.ts` | Appels API métier + gestion des erreurs (session expirée, message serveur) | 96–100 % |
| `sessionManager.ts` | Détection d'expiration de session, redirection vers le login | 100 % |
| `dateFormatter.ts` | Formatage de date | 100 % |

### Scénarios couverts (extraits représentatifs)

- **Intercepteur axios** : ajout du header `Authorization`, rejeu automatique après refresh réussi, déconnexion propre si le refresh échoue ou si aucun refresh token n'est disponible, pas de double-refresh sur une requête déjà rejouée
- **Stockage sécurisé** : chaque opération testée en succès *et* en échec (ex. Keychain/Keystore indisponible), pour vérifier que l'application dégrade proprement sans planter
- **Budget** : calcul du cumul du mois en excluant les paiements refusés et ceux des autres mois, déclenchement des trois paliers d'alerte (ok / approche / dépassé)
- **Chaque service métier** : cas nominal, session expirée (redirection login), message d'erreur backend transmis à l'utilisateur, message par défaut si le backend n'en fournit pas

---

## Synthèse pour le dossier de certification

- **214 tests unitaires au total** (89 backend + 125 frontend), tous exécutés automatiquement en CI à chaque push
- La couverture réelle dépasse **93 %** sur chacune des deux couches de logique métier ciblées (services + middlewares backend ; services + utilitaires frontend), largement au-dessus du seuil de "majorité du code développé" exigé
- Les zones volontairement hors périmètre (contrôleurs HTTP fins, composants d'interface) sont couvertes par ailleurs via le cahier de recettes fonctionnel (`docs/CAHIER_RECETTES.md`)
- Deux régressions de sécurité identifiées pendant cette itération (contrôle d'accès manquant sur le compte destination d'un virement, bug de génération d'IBAN) ont chacune donné lieu à un test dédié pour empêcher toute réapparition
