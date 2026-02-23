# Audit Sécurité & Refactor — Approviz Estimateur V2

**Date :** 2026-02-23  
**Modèle :** gemini-2.5-flash (via API Anthropic-compatible)  
**Scope :** Sécurité + Architecture JS

---

## A. Audit Sécurité

Voici l'analyse de sécurité du code fourni :

1.  **Vulnérabilité : CSP 'unsafe-inline' pour `script-src` et `style-src`**
    *   **Sévérité :** Haute
    *   **Ligne(s) concernée(s) :** Ligne 10 (`<meta http-equiv="Content-Security-Policy" ...>`)
    *   **Description :** L'utilisation de `'unsafe-inline'` dans `script-src` et `style-src` permet l'exécution de scripts et de styles inline, ce qui ouvre la porte aux attaques XSS (Cross-Site Scripting) si un attaquant parvient à injecter du contenu dans la page.
    *   **Correction concrète :**
        *   Pour `script-src` : Éviter `'unsafe-inline'`. Déplacer tous les scripts inline vers des fichiers externes. Si absolument nécessaire, utiliser des nonces (`'nonce-randomvalue'`) ou des hachages (`'sha256-...'`) pour les scripts spécifiques.
        *   Pour `style-src` : Éviter `'unsafe-inline'`. Déplacer tous les styles inline vers des fichiers CSS externes. Si absolument nécessaire, utiliser des nonces ou des hachages.
        *   Exemple (si tous les scripts/styles sont externes ou hachés) :
            ```html
            <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://calendly.com; frame-src https://calendly.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';">
            ```

2.  **Vulnérabilité : Absence de Subresource Integrity (SRI) pour les ressources CDN**
    *   **Sévérité :** Moyenne
    *   **Ligne(s) concernée(s) :** Lignes 17-19 (`<link rel="preconnect" ...>`, `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">`)
    *   **Description :** Les ressources chargées depuis des CDN externes (Google Fonts ici) ne sont pas protégées par SRI. Si le CDN est compromis, un attaquant pourrait injecter du code malveillant via ces ressources sans que le navigateur ne le détecte.
    *   **Correction concrète :** Ajouter l'attribut `integrity` avec la valeur de hachage SHA-256 (ou SHA-384/SHA-512) et l'attribut `crossorigin="anonymous"` aux balises `<link>` et `<script>` externes.
        *   Exemple pour Google Fonts (le hachage doit être généré pour la ressource spécifique) :
            ```html
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" integrity="sha384-..." crossorigin="anonymous">
            ```
            *(Note : Google Fonts ne fournit pas directement les hachages SRI pour ses feuilles de style. Une solution serait de télécharger les polices et de les héberger localement, ou d'accepter ce risque pour les polices.)*

3.  **Vulnérabilité : Absence de validation d'entrée (potentielle)**
    *   **Sévérité :** Moyenne (dépend de l'implémentation JS non visible)
    *   **Ligne(s) concernée(s) :** Non visible dans le code fourni, mais implicite pour tout formulaire ou interaction utilisateur.
    *   **Description :** Le code HTML/CSS ne montre pas de formulaires ou d'inputs. Cependant, tout site web interactif aura des points d'entrée utilisateur. Sans validation côté client (et surtout côté serveur), des données malveillantes peuvent être soumises, menant à des injections (XSS, SQL, etc.) ou à des erreurs logiques.
    *   **Correction concrète :**
        *   **Côté client :** Utiliser les attributs HTML5 (`pattern`, `maxlength`, `minlength`, `required`, `type="email"`, `type="number"`, etc.) et des validations JavaScript pour guider l'utilisateur et filtrer les entrées évidentes.
        *   **Côté serveur (essentiel) :** TOUJOURS valider, nettoyer et échapper toutes les entrées utilisateur avant de les traiter, de les stocker ou de les afficher.

4.  **Vulnérabilité : `autocomplete="off"` (potentiel problème d'expérience utilisateur/sécurité)**
    *   **Sévérité :** Faible (peut devenir Moyenne selon le contexte)
    *   **Ligne(s) concernée(s) :** Non visible dans le code fourni.
    *   **Description :** Si des champs de formulaire (non visibles ici) utilisent `autocomplete="off"` pour des informations non sensibles (ex: nom, adresse), cela peut dégrader l'expérience utilisateur. Pour les champs sensibles (mots de passe, numéros de carte de crédit), `autocomplete="new-password"` ou `autocomplete="cc-number"` est préférable pour permettre aux gestionnaires de mots de passe de fonctionner tout en indiquant la nature du champ. `autocomplete="off"` peut parfois être ignoré par les navigateurs pour les champs de mot de passe.
    *   **Correction concrète :**
        *   Pour les champs non sensibles : Omettre `autocomplete="off"` ou utiliser `autocomplete="on"`.
        *   Pour les champs sensibles : Utiliser les valeurs `autocomplete` appropriées (ex: `autocomplete="new-password"`, `autocomplete="current-password"`, `autocomplete="cc-number"`) pour une meilleure compatibilité avec les gestionnaires de mots de passe et une indication claire au navigateur.

5.  **Vulnérabilité : Erreurs console potentielles (CSS non fermé)**
    *   **Sévérité :** Faible
    *   **Ligne(s) concernée(s) :** Ligne 266 (`.hero-card-title { font-size: 11px;`)
    *   **Description :** Le code CSS est tronqué et ne se termine pas correctement. Cela peut entraîner des erreurs de parsing CSS dans le navigateur, potentiellement affecter le rendu de la page et, dans des cas extrêmes, ouvrir des vecteurs d'injection si le navigateur gère mal le CSS malformé (bien que ce soit rare pour le CSS).
    *   **Correction concrète :** Compléter le bloc CSS et s'assurer que toutes les accolades sont fermées.
        ```css
        .hero-card-title {
          font-size: 11px;
          /* ... reste du style ... */
        }
        ```

**Points positifs (bonnes pratiques de sécurité déjà en place) :**

*   **CSP (Content Security Policy) :** Présent et configuré avec `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. C'est une excellente base.
*   **Anti-Clickjacking (`X-Frame-Options` et `frame-ancestors`) :** `X-Frame-Options: DENY` et `frame-ancestors 'none'` dans la CSP sont très efficaces pour prévenir le clickjacking.
*   **`X-Content-Type-Options: nosniff` :** Prévient le "MIME type sniffing", réduisant les risques d'exécution de scripts malveillants avec un type MIME incorrect.
*   **`Referrer-Policy: strict-origin-when-cross-origin` :** Bonne politique de référent pour équilibrer confidentialité et fonctionnalité.
*   **`Permissions-Policy` :** Bonne pratique pour contrôler l'accès aux fonctionnalités sensibles du navigateur.
*   **HTTPS :** L'utilisation de `https://` pour les ressources externes (Google Fonts, Calendly) est une bonne pratique.

**Résumé des actions prioritaires :**

1.  **Éliminer `'unsafe-inline'` de la CSP** pour `script-src` et `style-src`.
2.  **Ajouter SRI** aux ressources CDN si possible.
3.  **Implémenter une validation robuste** des entrées utilisateur (côté client et surtout serveur) pour tout formulaire ou interaction.
4.  **Corriger le CSS tronqué.**

---

## B. Recommandations Architecture JS

Absolument ! En tant qu'architecte frontend senior, je vais vous guider à travers une refonte structurée et efficace de votre estimateur Approviz V2, en respectant toutes vos contraintes.

Je vais d'abord vous présenter l'architecture JS recommandée, puis des exemples concrets pour les calculs, la gestion d'état et la validation.

---

## Architecture JS Recommandée pour Approviz V2

Pour répondre aux exigences de robustesse, maintenabilité et évolutivité, je propose une architecture modulaire basée sur la séparation des préoccupations :

1.  **`config.js`**: Contient toutes les constantes, valeurs par défaut, seuils, et textes statiques. Facilite la modification des règles métier sans toucher à la logique.
2.  **`state.js`**: Gère l'état global de l'application. C'est la source unique de vérité pour toutes les données dynamiques (sélections, inputs utilisateur, résultats intermédiaires).
3.  **`model.js`**: Contient la logique métier pure, notamment tous les calculs. Ces fonctions sont pures (elles ne modifient pas l'état global et retournent toujours la même sortie pour la même entrée).
4.  **`validation.js`**: Centralise toutes les règles de validation pour les inputs utilisateur.
5.  **`ui.js`**: Gère toutes les interactions avec le DOM (rendu, écouteurs d'événements, mises à jour visuelles). Il interagit avec `state.js` pour lire/écrire les données et avec `model.js` pour déclencher les calculs.
6.  **`app.js`**: Le point d'entrée de l'application, qui initialise l'état, les écouteurs d'événements et le rendu initial.

### 1. Structure Recommandée (Fichiers)

```
/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   ├── state.js
│   ├── validation.js
│   ├── model.js
│   ├── ui.js
│   └── app.js
├── img/
│   ├── nanobanana/
│   │   ├── t-shirt.png
│   │   ├── hoodie.png
│   │   └── ...
│   ├── construction/
│   │   ├── hero.jpg
│   │   ├── chantier.jpg
│   │   └── ...
│   └── logo.png
└── audit.md
```

### 2. Fonctions Pures pour les Calculs (`model.js`)

Les fonctions de calcul doivent être pures : elles prennent des entrées, retournent une sortie, et n'ont pas d'effets de bord.

```javascript
// js/model.js

import { config } from './config.js';

/**
 * Calcule les économies administratives basées sur le temps et le nombre de gestionnaires.
 * @param {number} numManagers - Nombre de personnes gérant les articles promo.
 * @param {number} hoursPerManager - Heures par personne.
 * @returns {number} Économies administratives calculées.
 */
export function calculateAdminSavings(numManagers, hoursPerManager) {
    // Exemple de calcul : 50$/heure * nombre de managers * heures par manager
    const hourlyRate = config.ADMIN_HOURLY_RATE;
    return numManagers * hoursPerManager * hourlyRate;
}

/**
 * Calcule le coût total des produits sélectionnés.
 * @param {Object} selectedProducts - Objet { productId: quantity, ... }.
 * @param {Object} productPrices - Objet { productId: price, ... }.
 * @returns {number} Coût total des produits.
 */
export function calculateProductsCost(selectedProducts, productPrices) {
    let totalCost = 0;
    for (const productId in selectedProducts) {
        if (selectedProducts.hasOwnProperty(productId)) {
            const quantity = selectedProducts[productId];
            const price = productPrices[productId] || 0; // Assurez-vous que le prix existe
            totalCost += quantity * price;
        }
    }
    return totalCost;
}

/**
 * Applique les règles de plancher sur le total final.
 * @param {number} currentTotal - Le total calculé avant application du plancher.
 * @param {number} numEmployees - Nombre total d'employés.
 * @returns {Object} { finalTotal: number, floorApplied: boolean, floorValue: number }
 */
export function applyImpactFloor(currentTotal, numEmployees) {
    let floorValue = 0;
    if (numEmployees >= 50) {
        floorValue = config.FLOOR_RULES.GE_50;
    } else if (numEmployees >= 20) {
        floorValue = config.FLOOR_RULES.GE_20;
    } else if (numEmployees >= 1) {
        floorValue = config.FLOOR_RULES.GE_1;
    }

    const finalTotal = Math.max(currentTotal, floorValue);
    const floorApplied = finalTotal > currentTotal;

    return { finalTotal, floorApplied, floorValue };
}

/**
 * Calcule le total général incluant économies et produits, puis applique le plancher.
 * @param {Object} calculationInputs - Toutes les entrées nécessaires pour le calcul.
 * @param {number} calculationInputs.numManagers
 * @param {number} calculationInputs.hoursPerManager
 * @param {Object} calculationInputs.selectedProducts
 * @param {Object} calculationInputs.productPrices
 * @param {number} calculationInputs.numEmployees
 * @returns {Object} { totalSavings: number, totalProductsCost: number, finalTotal: number, floorApplied: boolean, floorValue: number }
 */
export function calculateOverallTotal(calculationInputs) {
    const { numManagers, hoursPerManager, selectedProducts, productPrices, numEmployees } = calculationInputs;

    const totalSavings = calculateAdminSavings(numManagers, hoursPerManager);
    const totalProductsCost = calculateProductsCost(selectedProducts, productPrices);

    const currentTotal = totalSavings + totalProductsCost; // Ou soustraction si savings est une réduction

    const { finalTotal, floorApplied, floorValue } = applyImpactFloor(currentTotal, numEmployees);

    return {
        totalSavings,
        totalProductsCost,
        finalTotal,
        floorApplied,
        floorValue
    };
}
```

### 3. Gestion d'État Centralisée (`state.js`)

L'état est un objet JavaScript simple, géré par des fonctions qui garantissent que les mises à jour sont faites de manière contrôlée.

```javascript
// js/state.js

import { config } from './config.js';

// État initial de l'application
const initialState = {
    currentStep: 1,
    // Étape 1
    numManagers: 1,
    hoursPerManager: config.DEFAULT_HOURS_PER_MANAGER,
    responsibleName: '',
    // Étape 2
    selectedProducts: {}, // { productId: quantity, ... }
    // Étape 3
    numEmployees: 0,
    // Résultats du calcul
    calculationResults: {
        totalSavings: 0,
        totalProductsCost: 0,
        finalTotal: 0,
        floorApplied: false,
        floorValue: 0
    },
    // UI state
    errors: {} // { fieldName: "message", ... }
};

let appState = { ...initialState }; // Copie pour éviter les références directes

// Les "subscribers" sont des fonctions qui seront appelées à chaque changement d'état
const subscribers = [];

/**
 * Récupère l'état actuel de l'application.
 * @returns {Object} L'état actuel.
 */
export function getState() {
    return { ...appState }; // Retourne une copie pour éviter les modifications directes
}

/**
 * Met à jour une partie de l'état et notifie les abonnés.
 * @param {Object} newStatePart - L'objet contenant les propriétés à mettre à jour.
 */
export function updateState(newStatePart) {
    appState = { ...appState, ...newStatePart };
    notifySubscribers();
}

/**
 * Réinitialise l'état à son état initial.
 */
export function resetState() {
    appState = { ...initialState };
    notifySubscribers();
}

/**
 * Ajoute une fonction à la liste des abonnés.
 * @param {Function} callback - La fonction à appeler lors d'un changement d'état.
 */
export function subscribe(callback) {
    subscribers.push(callback);
}

/**
 * Notifie tous les abonnés qu'un changement d'état a eu lieu.
 */
function notifySubscribers() {
    subscribers.forEach(callback => callback(getState()));
}
```

### 4. Pattern de Validation Robuste (`validation.js`)

Une approche par objet de validation, où chaque champ a ses propres règles.

```javascript
// js/validation.js

import { config } from './config.js';

/**
 * Valide un champ spécifique en fonction de ses règles.
 * @param {string} fieldName - Le nom du champ à valider.
 * @param {*} value - La valeur du champ.
 * @param {Object} allState - L'état complet de l'application (pour les validations inter-champs).
 * @returns {string|null} Message d'erreur si invalide, null si valide.
 */
export function validateField(fieldName, value, allState = {}) {
    switch (fieldName) {
        case 'numManagers':
            if (isNaN(value) || value < 1 || value > config.MAX_MANAGERS) {
                return `Le nombre de gestionnaires doit être entre 1 et ${config.MAX_MANAGERS}.`;
            }
            return null;
        case 'hoursPerManager':
            if (isNaN(value) || value < config.MIN_HOURS_PER_MANAGER || value > config.MAX_HOURS_PER_MANAGER) {
                return `Les heures par gestionnaire doivent être entre ${config.MIN_HOURS_PER_MANAGER} et ${config.MAX_HOURS_PER_MANAGER}.`;
            }
            return null;
        case 'responsibleName':
            if (!value || value.trim().length < 2) {
                return 'Le nom du responsable est requis (min 2 caractères).';
            }
            return null;
        case 'selectedProducts':
            if (Object.keys(value).length === 0) {
                return 'Veuillez sélectionner au moins un article promotionnel.';
            }
            return null;
        case 'numEmployees':
            if (isNaN(value) || value < 0) { // 0 employés est possible pour un devis initial
                return 'Le nombre total d\'employés doit être un nombre positif.';
            }
            return null;

---

## C. Corrections Appliquées dans la V2

| Mesure | Statut |
|--------|--------|
| Content Security Policy (CSP) | ✅ Appliqué |
| X-Frame-Options DENY | ✅ Appliqué |
| X-Content-Type-Options nosniff | ✅ Appliqué |
| Referrer-Policy strict | ✅ Appliqué |
| Permissions-Policy restrictive | ✅ Appliqué |
| rel="noopener noreferrer" liens externes | ✅ Appliqué |
| safeInt() / safeFloat() sanitisation | ✅ Appliqué |
| Liste blanche valeurs fréquence/produits | ✅ Appliqué |
| textContent (jamais innerHTML avec user data) | ✅ Appliqué |
| encodeURIComponent() params URL | ✅ Appliqué |
| Architecture config/state/model/ui séparée | ✅ Appliqué |
| Fonctions pures pour calculs | ✅ Appliqué |
| État centralisé (AppState) | ✅ Appliqué |
| Validation avec clamp strict | ✅ Appliqué |
