# Cahier de recettes — Finygo

## Informations générales

| Champ | Valeur |
|-------|--------|
| Application | Finygo — application bancaire mobile |
| Version testée | 1.2.0 |
| Date | 2026-07-02 |
| Environnement | Développement local (Expo Go / simulateur iOS) |

---

## Scénarios de test

### AUTH-01 — Inscription

| Champ | Détail |
|-------|--------|
| **ID** | AUTH-01 |
| **Fonctionnalité** | Inscription d'un nouvel utilisateur |
| **Prérequis** | Aucun compte existant avec cet email |
| **Étapes** | 1. Ouvrir l'application 2. Appuyer sur "Créer un compte" 3. Remplir prénom, nom, email, mot de passe (8 car. min., majuscule, chiffre, caractère spécial), date de naissance, lieu de naissance, adresse 4. Valider |
| **Résultat attendu** | Compte créé, redirection vers l'écran de connexion |
| **Résultat obtenu** | |
| **Statut** | |

---

### AUTH-02 — Connexion par mot de passe

| Champ | Détail |
|-------|--------|
| **ID** | AUTH-02 |
| **Fonctionnalité** | Connexion avec email et mot de passe |
| **Prérequis** | Compte existant (AUTH-01) |
| **Étapes** | 1. Saisir l'email et le mot de passe 2. Appuyer sur "Se connecter" |
| **Résultat attendu** | Accès au tableau de bord, token JWT stocké |
| **Résultat obtenu** | |
| **Statut** | |

---

### AUTH-03 — Connexion biométrique

| Champ | Détail |
|-------|--------|
| **ID** | AUTH-03 |
| **Fonctionnalité** | Connexion via Face ID / Touch ID |
| **Prérequis** | Connexion préalable par mot de passe sur l'appareil, biométrie activée |
| **Étapes** | 1. Rouvrir l'application 2. Appuyer sur le bouton biométrique 3. S'authentifier avec Face ID ou Touch ID |
| **Résultat attendu** | Connexion automatique sans saisir le mot de passe |
| **Résultat obtenu** | |
| **Statut** | |

---

### COMPTE-01 — Consultation des comptes et soldes

| Champ | Détail |
|-------|--------|
| **ID** | COMPTE-01 |
| **Fonctionnalité** | Consultation du solde des comptes |
| **Prérequis** | Connecté (AUTH-02), au moins un compte ouvert |
| **Étapes** | 1. Accéder à l'écran Accueil 2. Faire défiler les comptes (swipe horizontal) |
| **Résultat attendu** | Chaque compte affiche son type et son solde actuel |
| **Résultat obtenu** | |
| **Statut** | |

---

### COMPTE-02 — Création d'un compte épargne

| Champ | Détail |
|-------|--------|
| **ID** | COMPTE-02 |
| **Fonctionnalité** | Création d'un nouveau type de compte |
| **Prérequis** | Connecté, pas de compte ÉPARGNE existant |
| **Étapes** | 1. Sur la page ÉPARGNE, appuyer sur "Ouvrir un compte épargne" |
| **Résultat attendu** | Compte ÉPARGNE créé avec solde à 0 |
| **Résultat obtenu** | |
| **Statut** | |

---

### VIR-01 — Virement interne (cas nominal)

| Champ | Détail |
|-------|--------|
| **ID** | VIR-01 |
| **Fonctionnalité** | Virement entre deux comptes propres |
| **Prérequis** | Connecté, compte BANCAIRE avec solde ≥ montant voulu, compte ÉPARGNE ou POCKET existant |
| **Étapes** | 1. Accueil → compte bancaire → bouton "+" 2. Sélectionner le compte de destination 3. Saisir un montant valide et un libellé 4. Valider |
| **Résultat attendu** | Solde source débité, solde destination crédité, confirmation affichée |
| **Résultat obtenu** | |
| **Statut** | |

---

### VIR-02 — Virement interne — solde insuffisant

| Champ | Détail |
|-------|--------|
| **ID** | VIR-02 |
| **Fonctionnalité** | Rejet d'un virement si solde insuffisant |
| **Prérequis** | Compte BANCAIRE avec solde < montant voulu |
| **Étapes** | 1. Lancer un virement interne avec un montant supérieur au solde 2. Valider |
| **Résultat attendu** | Message d'erreur "Solde insuffisant", aucun solde modifié |
| **Résultat obtenu** | |
| **Statut** | |

---

### VIR-03 — Virement interne — montant invalide

| Champ | Détail |
|-------|--------|
| **ID** | VIR-03 |
| **Fonctionnalité** | Rejet d'un montant nul ou négatif |
| **Prérequis** | Connecté |
| **Étapes** | 1. Saisir 0 ou un montant négatif dans le champ montant 2. Valider |
| **Résultat attendu** | Message d'erreur "Le montant doit être positif", aucun solde modifié |
| **Résultat obtenu** | |
| **Statut** | |

---

### BEN-01 — Ajout d'un bénéficiaire

| Champ | Détail |
|-------|--------|
| **ID** | BEN-01 |
| **Fonctionnalité** | Enregistrement d'un bénéficiaire |
| **Prérequis** | Connecté |
| **Étapes** | 1. Onglet Virements → icône personne → "Mes bénéficiaires" 2. Saisir nom et IBAN valides 3. Appuyer sur "Ajouter le bénéficiaire" |
| **Résultat attendu** | Bénéficiaire ajouté, affiché dans la liste |
| **Résultat obtenu** | |
| **Statut** | |

---

### BEN-02 — Suppression d'un bénéficiaire

| Champ | Détail |
|-------|--------|
| **ID** | BEN-02 |
| **Fonctionnalité** | Suppression d'un bénéficiaire |
| **Prérequis** | Au moins un bénéficiaire existant (BEN-01) |
| **Étapes** | 1. "Mes bénéficiaires" 2. Appuyer sur "Supprimer" en face du bénéficiaire 3. Confirmer |
| **Résultat attendu** | Bénéficiaire retiré de la liste |
| **Résultat obtenu** | |
| **Statut** | |

---

### BEN-03 — Virement externe (cas nominal)

| Champ | Détail |
|-------|--------|
| **ID** | BEN-03 |
| **Fonctionnalité** | Virement vers un bénéficiaire |
| **Prérequis** | Compte BANCAIRE avec solde suffisant, au moins un bénéficiaire (BEN-01) |
| **Étapes** | 1. Onglet Virements → icône "+" 2. Sélectionner le bénéficiaire 3. Saisir un montant et un libellé 4. Valider |
| **Résultat attendu** | Solde débité, transaction enregistrée avec le bénéficiaire associé |
| **Résultat obtenu** | |
| **Statut** | |

---

### VP-01 — Création d'un virement programmé

| Champ | Détail |
|-------|--------|
| **ID** | VP-01 |
| **Fonctionnalité** | Planification d'un virement récurrent |
| **Prérequis** | Compte BANCAIRE, bénéficiaire enregistré |
| **Étapes** | 1. Onglet Virements → icône calendrier 2. Sélectionner bénéficiaire, fréquence, montant et date 3. Appuyer sur "Programmer le virement" |
| **Résultat attendu** | Virement programmé créé, visible dans la liste avec statut ACTIF |
| **Résultat obtenu** | |
| **Statut** | |

---

### VP-02 — Annulation d'un virement programmé

| Champ | Détail |
|-------|--------|
| **ID** | VP-02 |
| **Fonctionnalité** | Annulation d'un virement programmé actif |
| **Prérequis** | Un virement programmé ACTIF existant (VP-01) |
| **Étapes** | 1. Liste des virements programmés 2. Appuyer sur "Annuler" 3. Confirmer |
| **Résultat attendu** | Statut du virement passe à ANNULE |
| **Résultat obtenu** | |
| **Statut** | |

---

### HIST-01 — Consultation de l'historique et graphiques

| Champ | Détail |
|-------|--------|
| **ID** | HIST-01 |
| **Fonctionnalité** | Historique des transactions et graphiques de dépenses |
| **Prérequis** | Au moins une transaction effectuée |
| **Étapes** | 1. Accueil → faire défiler vers le bas 2. Consulter LastPayments et DepenseGraphique |
| **Résultat attendu** | Derniers paiements listés, graphique de dépenses par catégorie affiché |
| **Résultat obtenu** | |
| **Statut** | |

---

### PROFIL-01 — Consultation et déconnexion

| Champ | Détail |
|-------|--------|
| **ID** | PROFIL-01 |
| **Fonctionnalité** | Accès au profil et déconnexion |
| **Prérequis** | Connecté |
| **Étapes** | 1. Accueil → icône personne en haut à gauche 2. Consulter les informations 3. Appuyer sur "Déconnexion" |
| **Résultat attendu** | Retour à l'écran de connexion, token supprimé du stockage sécurisé |
| **Résultat obtenu** | |
| **Statut** | |

---

### SEC-01 — Rate limiting sur le login

| Champ | Détail |
|-------|--------|
| **ID** | SEC-01 |
| **Fonctionnalité** | Blocage après 5 tentatives de connexion échouées |
| **Prérequis** | Backend en cours d'exécution |
| **Étapes** | 1. Effectuer 5 tentatives de connexion avec un mauvais mot de passe 2. Effectuer une 6e tentative |
| **Résultat attendu** | Réponse HTTP 429 avec message "Trop de tentatives de connexion" |
| **Résultat obtenu** | |
| **Statut** | |

---

## Légende statuts

| Statut | Signification |
|--------|---------------|
| ✅ OK | Test réussi, comportement conforme |
| ❌ KO | Test échoué, comportement non conforme |
| ⚠️ PARTIEL | Test partiellement réussi |
| 🔲 N/T | Non testé |
