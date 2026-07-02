# Accessibilité — Finygo

## Référentiel retenu : RGAA

Le **Référentiel Général d'Amélioration de l'Accessibilité (RGAA)** a été retenu car il s'agit du référentiel officiel français, aligné sur les Web Content Accessibility Guidelines (WCAG) 2.1 niveau AA, et recommandé pour toute application destinée à un public francophone.

---

## Actions mises en œuvre

### 1. Étiquetage des éléments interactifs

Tous les boutons, champs de saisie et éléments cliquables ont reçu :
- `accessibilityRole` : rôle sémantique (`"button"`, `"header"`, `"text"`)
- `accessibilityLabel` : description vocale lue par le lecteur d'écran
- `accessibilityHint` : description de l'action déclenchée (si non évidente)
- `accessibilityState` : état dynamique (ex. `{ disabled: true }`)

Composants concernés : `NavBarHome`, `NavBarTransfert`, `BackHeader`, `ActionButtons`, `LastPayments`, écrans `beneficiaires`, `transfer-account`, `transfer-beneficiaire`, `virements-programmes`, `profile`.

### 2. Annonce des montants et soldes

Les montants sont exprimés avec une unité explicite pour les lecteurs d'écran :

```tsx
// Avant
<Text>{payment.montant}€</Text>

// Après
<Text accessibilityLabel={`Montant : ${payment.montant} euros`}>
  -{payment.montant}€
</Text>
```

Les soldes de comptes sont annoncés sous la forme `"Solde : 250 euros"` plutôt que `"250"`.

### 3. Tailles de zones tactiles

Tous les boutons icônes respectent une taille minimale de **44 × 44 points** :

```tsx
iconContainer: {
  width: 44,
  height: 44,
  // ...
}
```

### 4. Onglets de navigation

Les onglets de la navigation principale disposent d'un `tabBarAccessibilityLabel` :

```tsx
<Tabs.Screen
  name="index"
  options={{
    title: 'Accueil',
    tabBarAccessibilityLabel: 'Accueil',
    // ...
  }}
/>
```

### 5. Contrastes (vérification)

Les écrans principaux utilisent un texte blanc (`#FFFFFF`) sur fond dégradé foncé (bleu profond `#1a237e` → violet `#4a148c`). Le ratio de contraste dépasse **7:1**, bien au-delà du minimum RGAA de 4,5:1 pour le texte normal.

Pour les textes secondaires (`rgba(255,255,255,0.7)`), le ratio est d'environ **4,6:1**, conforme au seuil RGAA.

---

## Exemples de code — avant / après

### Bouton de retour (BackHeader)

```tsx
// Avant
<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
    <Ionicons name="arrow-back" size={24} color="#fff" />
</TouchableOpacity>

// Après
<TouchableOpacity
    onPress={() => router.back()}
    style={styles.backButton}
    accessibilityRole="button"
    accessibilityLabel="Retour"
    accessibilityHint="Revient à l'écran précédent"
>
    <Ionicons name="arrow-back" size={24} color="#fff" />
</TouchableOpacity>
```

### Bouton avec état désactivé (formulaire bénéficiaire)

```tsx
// Avant
<TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} disabled={loading}>
    <Text>{loading ? 'Ajout...' : 'Ajouter le bénéficiaire'}</Text>
</TouchableOpacity>

// Après
<TouchableOpacity
    style={[styles.button, loading && styles.buttonDisabled]}
    disabled={loading}
    accessibilityRole="button"
    accessibilityLabel="Ajouter le bénéficiaire"
    accessibilityState={{ disabled: loading }}
>
    <Text>{loading ? 'Ajout...' : 'Ajouter le bénéficiaire'}</Text>
</TouchableOpacity>
```

### Champ de saisie (IBAN)

```tsx
// Avant
<TextInput placeholder="FR76 XXXX..." value={iban} onChangeText={setIban} />

// Après
<TextInput
    placeholder="FR76 XXXX..."
    value={iban}
    onChangeText={setIban}
    accessibilityLabel="IBAN du bénéficiaire"
    accessibilityHint="Entrez le numéro IBAN du bénéficiaire"
/>
```

---

## Limites identifiées

- Les graphiques de dépenses (`DepenseGraphique`) ne disposent pas encore d'une alternative textuelle complète ; une description globale (`accessibilityLabel` sur le conteneur) est prévue.
- La vérification des contrastes a été effectuée manuellement ; un outil automatisé (ex. Colour Contrast Analyser) pourrait être utilisé lors d'un audit complet.
