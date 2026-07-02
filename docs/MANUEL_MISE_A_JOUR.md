# Manuel de mise à jour — Finygo

## Processus général

```
1. Sauvegarder la base de données
2. Récupérer la nouvelle version (git pull)
3. Mettre à jour les dépendances backend
4. Appliquer les migrations Prisma
5. Rebuilder et redémarrer le backend
6. Mettre à jour et rebuilder le frontend
7. Vérifier le bon fonctionnement
```

---

## 1. Sauvegarde préalable

Avant toute mise à jour, effectuer une sauvegarde de la base de données :

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 2. Récupérer la nouvelle version

```bash
cd /var/www/informatique/projet
git pull origin main
```

Vérifier le `CHANGELOG.md` pour identifier les changements et les éventuelles migrations requises.

---

## 3. Mise à jour du backend

```bash
cd back-end
nvm use 24
npm install
```

### 3.1 Appliquer les migrations de base de données

Si le `CHANGELOG.md` mentionne des modifications de schéma :

```bash
npx prisma migrate deploy
npx prisma generate
```

### 3.2 Vérifier les tests

```bash
npm test
```

S'assurer que tous les tests passent avant de continuer.

### 3.3 Rebuilder et redémarrer

```bash
npm run build
pm2 restart finygo-api
```

Ou sans PM2 :

```bash
pkill -f "node build/bin/server.js"
node build/bin/server.js &
```

---

## 4. Mise à jour du frontend

```bash
cd app-bank
nvm use 24
npm install
```

### 4.1 Build de production mis à jour

```bash
npx eas build --platform android --profile production
# ou
npx eas build --platform ios --profile production
```

Pour un test rapide en local :

```bash
npx expo start
```

---

## 5. Vérification post-mise à jour

Après chaque mise à jour, rejouer les scénarios critiques du `CAHIER_RECETTES.md` :

- `AUTH-02` : Connexion par mot de passe
- `VIR-01` : Virement interne nominal
- `BEN-03` : Virement externe nominal

---

## 6. Rollback

En cas de problème grave :

### 6.1 Revenir à la version précédente

```bash
git log --oneline -10   # identifier le commit précédent
git checkout <commit-sha>
```

### 6.2 Restaurer la base de données

```bash
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

### 6.3 Annuler la dernière migration Prisma

```bash
cd back-end
npx prisma migrate resolve --rolled-back <nom-de-la-migration>
```

---

## 7. Versioning

Les versions suivent le schéma `MAJEUR.MINEUR.PATCH` (SemVer) :

| Type de changement | Incrément |
|--------------------|-----------|
| Nouvelle fonctionnalité | MINEUR (ex. 1.2.0 → 1.3.0) |
| Correctif de bogue | PATCH (ex. 1.2.0 → 1.2.1) |
| Rupture de compatibilité | MAJEUR (ex. 1.2.0 → 2.0.0) |

Consulter `CHANGELOG.md` à la racine du projet pour l'historique complet des versions.
