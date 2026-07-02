# Plan de correction des bogues — Finygo

## Processus général

```
Détection → Qualification → Correction → Vérification → Clôture
```

---

## 1. Détection

Un bogue peut être détecté via :
- **Tests unitaires** : un test Vitest qui échoue sur la branche CI
- **Cahier de recettes** : scénario marqué KO lors d'une campagne de tests manuelle
- **Utilisateur** : remontée d'anomalie en production ou recette
- **Monitoring** : log d'erreur côté serveur (AdonisJS logger)

**Action immédiate** : ouvrir une issue GitHub avec le titre, les étapes de reproduction, le résultat obtenu et le résultat attendu.

---

## 2. Qualification

| Niveau | Criticité | Exemples | Délai cible |
|--------|-----------|----------|-------------|
| **P1 — Critique** | Bloquant en production | Impossible de se connecter, virement dupliqué, fuite de données | < 4 h |
| **P2 — Majeur** | Fonctionnalité principale dégradée | Solde affiché incorrect, virement refusé à tort | < 24 h |
| **P3 — Mineur** | Gêne sans perte de données | Affichage incorrect, libellé manquant | < 1 semaine |
| **P4 — Cosmétique** | Aucun impact fonctionnel | Faute de frappe, alignement | Prochain sprint |

---

## 3. Correction

1. Créer une branche `fix/nom-du-bogue` depuis `main`
2. Reproduire le bogue via un test unitaire (test rouge)
3. Corriger le code (test vert)
4. Vérifier que le pipeline CI passe (lint + tests + typecheck)
5. Ouvrir une Pull Request avec référence à l'issue

---

## 4. Vérification

- Relecture du PR par un pair (ou auto-revue si développeur seul)
- Rejeu du scénario du cahier de recettes concerné
- Mise à jour du statut dans `CAHIER_RECETTES.md` (OK / KO)
- Merge dans `main` uniquement si CI ✅

---

## 5. Clôture

- Fermer l'issue GitHub
- Documenter le correctif dans `CHANGELOG.md` sous `[Unreleased]` ou la prochaine version
- Créer un tag Git si le correctif justifie une release patch (ex. `v1.2.1`)
