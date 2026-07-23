# Sécurité — Finygo

## Référentiel : OWASP Top 10 (2021)

Ce document recense chaque faille du OWASP Top 10 et la mesure correspondante mise en place dans Finygo.

---

## A01 — Broken Access Control (Contrôle d'accès défaillant)

**Risque** : Un utilisateur accède aux données ou aux comptes d'un autre utilisateur.

**Mesures appliquées :**
- Toutes les routes protégées passent par le middleware `auth_middleware` qui vérifie le JWT et injecte `ctx.user`.
- Les services métier vérifient systématiquement que la ressource demandée appartient à l'utilisateur authentifié avant toute opération. Exemple dans `transaction_service.ts` :
  ```typescript
  if (compteSource.userId !== userId) throw new Error('Accès refusé') // 403
  ```
- Les bénéficiaires sont filtrés par `userId` : un utilisateur ne peut voir, modifier ou supprimer que ses propres bénéficiaires.
- Aucune route admin exposée en V1.

---

## A02 — Cryptographic Failures (Défaillances cryptographiques)

**Risque** : Mots de passe en clair, tokens prévisibles, communications non chiffrées.

**Mesures appliquées :**
- Mots de passe hachés avec **Bcrypt** (salt rounds = 10) — jamais stockés en clair.
- Tokens JWT signés (HS256) avec une `APP_KEY` générée aléatoirement (`node ace generate:key`).
- Access token à courte durée de vie (15 min) ; refresh token révocable (stocké en base avec `revokedAt`).
- Tokens mobiles stockés dans **Expo SecureStore** : Keychain (iOS) ou EncryptedSharedPreferences AES-256 (Android) — jamais dans AsyncStorage.
- Communications chiffrées via HTTPS en production (Supabase + hébergement).

---

## A03 — Injection

**Risque** : Injection SQL, injection de commandes.

**Mesures appliquées :**
- **Prisma ORM** est utilisé pour toutes les requêtes base de données. Il génère des requêtes paramétrées ; aucune concaténation de chaîne SQL n'est effectuée.
- **VineJS** valide et assainit toutes les entrées utilisateur avant qu'elles atteignent la couche service :
  - Montants : `vine.number().positive().decimal([0, 2])`
  - IBAN : regex `/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/`
  - Libellés : `vine.string().trim().maxLength(255)`
  - Enums : `vine.enum(['BANCAIRE', 'EPARGNE', 'POCKET'] as const)`

---

## A04 — Insecure Design (Conception non sécurisée)

**Risque** : Architecture sans mécanismes de défense intégrés.

**Mesures appliquées :**
- Architecture MVC avec séparation des responsabilités : validation → controller → service → ORM.
- Les virements sont atomiques (transaction SQL Prisma `$transaction`) : si le crédit échoue, le débit est annulé.
- Pas de découvert autorisé en V1 : le service rejette tout virement dont le montant dépasse le solde disponible.
- Les refresh tokens sont stockés en base (non stateless) pour permettre la révocation immédiate.

---

## A05 — Security Misconfiguration (Mauvaise configuration de sécurité)

**Risque** : Stack traces exposées, headers manquants, CORS trop permissif.

**Mesures appliquées :**
- **Headers HTTP de sécurité** injectés par `security_headers_middleware` sur toutes les réponses :
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **Exception handler** (`app/exceptions/handler.ts`) : en production, les erreurs 500 retournent uniquement `{ message: 'Une erreur interne est survenue' }` — aucune stack trace ni détail SQL n'est exposé.
- CORS configuré pour n'autoriser que les origines du frontend.

---

## A06 — Vulnerable and Outdated Components (Composants vulnérables ou obsolètes)

**Risque** : Dépendances avec CVE connues exploitables.

**Mesures appliquées :**
- `npm audit` intégré dans le pipeline CI (`.github/workflows/ci.yml`) à chaque push — les résultats sont visibles sans bloquer le build (non bloquant intentionnel pour ne pas stopper la CI sur des vulnérabilités sans correctif disponible).
- Node.js 24 (LTS actif) utilisé en développement et en CI.
- Dépendances backend et frontend maintenues à jour via les scripts CI.

---

## A07 — Identification and Authentication Failures (Défaillances d'authentification)

**Risque** : Brute force, credential stuffing, sessions non expirées.

**Mesures appliquées :**
- **Rate limiting** sur `POST /auth/login` : 5 tentatives par minute par IP via `rate_limit_middleware` (Map en mémoire, fenêtre glissante d'1 minute, purge périodique des entrées expirées toutes les 5 minutes pour éviter une croissance illimitée de la Map). Réponse HTTP 429 au dépassement.
- **Politique de mot de passe** : 8 caractères minimum, au moins une majuscule, un chiffre et un caractère spécial, appliquée côté client (feedback immédiat) et re-vérifiée côté serveur (`createUserValidator`, source de vérité).
- Access token de courte durée (15 min) ; expiration gérée côté backend.
- Refresh token révocable : la déconnexion (`POST /auth/logout`) révoque le token en base (`revokedAt = now()`). Rotation à chaque refresh avec détection de réutilisation (un refresh token déjà consommé déclenche la révocation de toutes les sessions actives de l'utilisateur).
- Authentification biométrique (Face ID / Touch ID) disponible comme second facteur rapide côté mobile.

**Limite identifiée :** Le rate limiting est appliqué par IP, pas par compte. Un attaquant distribuant ses tentatives sur plusieurs IP contournerait la limite actuelle. Un verrouillage de compte après N échecs (indépendant de l'IP) est une amélioration V2 possible, à mettre en balance avec le risque de déni de service par verrouillage volontaire d'un compte tiers (attaque bien connue sur ce type de mécanisme).

---

## A08 — Software and Data Integrity Failures (Défaillances d'intégrité)

**Risque** : Dépendances malveillantes (supply chain), désérialisation non sûre.

**Mesures appliquées :**
- `npm audit` dans la CI détecte les paquets avec CVE connues.
- `package-lock.json` versionné pour fixer les versions exactes des dépendances (pas de flottement implicite en CI).
- Aucune désérialisation d'objets non fiables : les données entrantes sont toutes validées par VineJS avant usage.

---

## A09 — Security Logging and Monitoring Failures (Défaillances de journalisation)

**Risque** : Absence de traces permettant de détecter ou d'analyser une attaque.

**Mesures appliquées :**
- **Logger AdonisJS** activé en production : toutes les requêtes HTTP (méthode, route, statut, durée) sont enregistrées.
- Les tentatives de connexion échouées générant un 429 sont tracées par le middleware de rate limiting.
- Les accès refusés (403) et non trouvés (404) retournent des codes HTTP standards permettant une détection d'anomalies.

**Limite identifiée :** Pas d'agrégation centralisée des logs (Sentry, ELK) en V1 — prévu en V2.

---

## A10 — Server-Side Request Forgery — SSRF

**Risque** : Le serveur effectue des requêtes HTTP vers des ressources internes non exposées.

**Applicabilité :** Non applicable en V1. Le backend ne fait aucun appel HTTP sortant initié par des données utilisateur (pas de webhook, pas de proxy, pas de récupération d'URL fournie par le client).

---

## Synthèse

| # | Faille OWASP | Statut | Mesure principale |
|---|-------------|--------|-------------------|
| A01 | Broken Access Control | ✅ Couvert | Vérification `userId` dans chaque service |
| A02 | Cryptographic Failures | ✅ Couvert | Bcrypt, JWT signé, SecureStore AES |
| A03 | Injection | ✅ Couvert | Prisma ORM paramétré + VineJS |
| A04 | Insecure Design | ✅ Couvert | Virements atomiques, pas de découvert |
| A05 | Security Misconfiguration | ✅ Couvert | Headers HTTP, exception handler |
| A06 | Vulnerable Components | ✅ Couvert | `npm audit` en CI |
| A07 | Authentication Failures | ✅ Couvert (⚠️ rate limit par IP uniquement) | Rate limiting, politique de mot de passe, refresh token rotatif révocable |
| A08 | Integrity Failures | ✅ Couvert | `npm audit`, `package-lock.json` versionné |
| A09 | Logging & Monitoring | ⚠️ Partiel | Logger AdonisJS, pas d'agrégation centralisée |
| A10 | SSRF | N/A | Aucun appel HTTP sortant en V1 |
