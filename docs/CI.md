# Protocole d'intégration continue — Finygo

## Déclencheurs

Le pipeline CI s'exécute automatiquement :
- À chaque **push** sur n'importe quelle branche
- À chaque **pull request** ouverte ou mise à jour

## Jobs

Le workflow est découpé en deux jobs parallèles, l'un pour le backend et l'autre pour le frontend.

---

### Job `backend` — Backend (AdonisJS)

| Étape | Commande | Bloquant |
|-------|----------|----------|
| Checkout du code | `actions/checkout@v4` | oui |
| Installation des dépendances | `npm ci` | oui |
| Lint (ESLint) | `npm run lint` | oui |
| Tests unitaires (Vitest) | `npm test` | oui |
| Vérification TypeScript | `npm run typecheck` | oui |
| Audit des dépendances | `npm audit --audit-level=critical` | non (`\|\| true`) |

Le pipeline **échoue** si le lint, les tests ou le typecheck retournent une erreur. L'audit est exécuté à titre informatif mais ne bloque pas le pipeline.

---

### Job `frontend` — Frontend (Expo / React Native)

| Étape | Commande | Bloquant |
|-------|----------|----------|
| Checkout du code | `actions/checkout@v4` | oui |
| Installation des dépendances | `npm ci` | oui |
| Lint (ESLint) | `npm run lint` | oui |

---

## Séquence d'intégration

```
Push / Pull Request
        │
        ├──► [backend]
        │       ├── npm ci
        │       ├── eslint .              ← échoue si erreur
        │       ├── vitest run            ← échoue si test KO
        │       ├── tsc --noEmit          ← échoue si type error
        │       └── npm audit             ← informatif
        │
        └──► [frontend]
                ├── npm ci
                └── eslint .              ← échoue si erreur
```

Les deux jobs s'exécutent en **parallèle**. Un échec sur l'un n'interrompt pas l'autre.

## Environnement

- Runner : `ubuntu-latest`
- Node.js : `24`
- Cache npm activé (via `cache-dependency-path` sur chaque `package-lock.json`)

## Fichier de configuration

`.github/workflows/ci.yml`
