# Manuel d'utilisation — Finygo

## Présentation

Finygo est une application bancaire mobile permettant de gérer plusieurs comptes, d'effectuer des virements et de programmer des paiements récurrents.

---

## 1. Première connexion

### 1.1 Créer un compte

1. Au lancement, appuyez sur **"Créer un compte"**
2. Renseignez vos informations personnelles :
   - Prénom, nom, email
   - Mot de passe (minimum 8 caractères)
   - Date de naissance, lieu de naissance, adresse
3. Appuyez sur **"S'inscrire"**

### 1.2 Se connecter

1. Entrez votre email et votre mot de passe
2. Appuyez sur **"Se connecter"**

### 1.3 Connexion biométrique

Après une première connexion par mot de passe, les accès suivants peuvent utiliser **Face ID** ou **Touch ID** : appuyez sur le bouton empreinte sur l'écran de connexion.

---

## 2. Écran d'accueil

L'écran d'accueil affiche :

- **Solde** de votre compte bancaire principal
- **Swipe horizontal** entre vos comptes (bancaire, épargne, pocket)
- **Patrimoine total** (somme de tous les comptes)
- **Graphique des dépenses** par catégorie sur les 30 derniers jours
- **Derniers paiements** reçus

### 2.1 Ouvrir un nouveau compte

Si vous n'avez pas encore de compte ÉPARGNE ou POCKET, un bouton **"Ouvrir un compte"** apparaît sur la page correspondante du swipe.

---

## 3. Virements

### 3.1 Virement entre vos comptes

1. Depuis l'accueil, swipez vers le compte source
2. Appuyez sur **"+"**
3. Sélectionnez **"Virer vers un de mes comptes"**
4. Choisissez le compte de destination
5. Saisissez le montant et un libellé (optionnel)
6. Appuyez sur **"Valider le virement"**

### 3.2 Virement vers un bénéficiaire

1. Onglet **Virements** → icône **"+"**
2. Sélectionnez le bénéficiaire dans la liste
3. Saisissez le montant et un libellé (optionnel)
4. Appuyez sur **"Valider le virement"**

---

## 4. Bénéficiaires

### 4.1 Ajouter un bénéficiaire

1. Onglet **Virements** → icône **personne**
2. Saisissez le **nom** et l'**IBAN** du bénéficiaire
3. Appuyez sur **"Ajouter le bénéficiaire"**

> L'IBAN doit être au format international : `FR76 XXXX XXXX XXXX XXXX XXXX XXX`

### 4.2 Supprimer un bénéficiaire

Dans la liste des bénéficiaires, appuyez sur **"Supprimer"** en face du bénéficiaire concerné, puis confirmez.

---

## 5. Virements programmés

### 5.1 Créer un virement programmé

1. Onglet **Virements** → icône **calendrier**
2. Sélectionnez le bénéficiaire
3. Choisissez la fréquence : **Ponctuel**, **Quotidien**, **Hebdomadaire** ou **Mensuel**
4. Saisissez le montant, le libellé et la date de première exécution
5. Appuyez sur **"Programmer le virement"**

### 5.2 Annuler un virement programmé

Dans la liste des virements programmés, appuyez sur **"Annuler"** en face du virement à stopper.

---

## 6. Profil

Accès via l'icône **personne** en haut à gauche de l'accueil.

- **Informations personnelles** : consulter vos données enregistrées
- **Déconnexion** : vous déconnecte et supprime le token de votre appareil

---

## 7. Erreurs courantes

| Erreur affichée | Cause probable | Solution |
|-----------------|----------------|----------|
| "Solde insuffisant" | Le solde du compte source est inférieur au montant | Réduire le montant ou recharger le compte |
| "Le montant doit être positif" | Montant nul ou négatif saisi | Saisir un montant > 0 |
| "IBAN invalide" | Format IBAN incorrect | Vérifier et ressaisir l'IBAN |
| "Trop de tentatives de connexion" | 5 tentatives échouées en moins d'1 minute | Patienter 1 minute et réessayer |
