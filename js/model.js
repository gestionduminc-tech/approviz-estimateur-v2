/**
 * APPROVIZ ESTIMATEUR V2 - MODEL
 * Fonctions pures de calcul et validation
 * IMPORTANT: Aucun accès DOM dans ce fichier
 */

'use strict';

/**
 * Module Model - Logique métier pure
 */
var Model = (function() {
    
    /**
     * Parse et clamp un entier de manière sécurisée
     * @param {*} val - Valeur à parser
     * @param {number} min - Valeur minimum
     * @param {number} max - Valeur maximum
     * @param {number} fallback - Valeur par défaut si invalide
     * @returns {number} Entier validé et clampé
     */
    function safeInt(val, min, max, fallback) {
        // Vérifier que les paramètres sont valides
        if (typeof min !== 'number' || typeof max !== 'number' || typeof fallback !== 'number') {
            return fallback;
        }
        
        // Parser la valeur
        var parsed = parseInt(val, 10);
        
        // Si NaN ou non fini, retourner fallback
        if (isNaN(parsed) || !isFinite(parsed)) {
            return fallback;
        }
        
        // Clamp entre min et max
        if (parsed < min) {
            return min;
        }
        if (parsed > max) {
            return max;
        }
        
        return parsed;
    }
    
    /**
     * Parse et clamp un float de manière sécurisée
     * @param {*} val - Valeur à parser
     * @param {number} min - Valeur minimum
     * @param {number} max - Valeur maximum
     * @param {number} fallback - Valeur par défaut si invalide
     * @returns {number} Float validé et clampé
     */
    function safeFloat(val, min, max, fallback) {
        // Vérifier que les paramètres sont valides
        if (typeof min !== 'number' || typeof max !== 'number' || typeof fallback !== 'number') {
            return fallback;
        }
        
        // Parser la valeur
        var parsed = parseFloat(val);
        
        // Si NaN ou non fini, retourner fallback
        if (isNaN(parsed) || !isFinite(parsed)) {
            return fallback;
        }
        
        // Clamp entre min et max
        if (parsed < min) {
            return min;
        }
        if (parsed > max) {
            return max;
        }
        
        return parsed;
    }
    
    /**
     * Valide que le nombre de commandes est dans la whitelist
     * @param {number} value - Nombre de commandes
     * @returns {boolean} True si valide
     */
    function isValidOrdersYear(value) {
        var parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            return false;
        }
        return CONFIG.ALLOWED_ORDERS_YEAR.indexOf(parsed) !== -1;
    }
    
    /**
     * Calcul des économies sur le temps administratif
     * Formule: nbPersonnes × heuresCommande × nbCommandesAn × TAUX_HORAIRE × REDUCTION_TEMPS
     * @param {number} nbPersonnes - Nombre de personnes gérant les commandes
     * @param {number} heuresCommande - Heures passées par commande
     * @param {number} nbCommandesAn - Nombre de commandes par an
     * @returns {number} Économies admin en dollars
     */
    function calcAdmin(nbPersonnes, heuresCommande, nbCommandesAn) {
        var personnes = safeInt(
            nbPersonnes,
            CONFIG.LIMITS.NB_PERSONNES.MIN,
            CONFIG.LIMITS.NB_PERSONNES.MAX,
            CONFIG.LIMITS.NB_PERSONNES.DEFAULT
        );
        
        var heures = safeFloat(
            heuresCommande,
            CONFIG.LIMITS.HEURES_COMMANDE.MIN,
            CONFIG.LIMITS.HEURES_COMMANDE.MAX,
            CONFIG.LIMITS.HEURES_COMMANDE.DEFAULT
        );
        
        var commandes = isValidOrdersYear(nbCommandesAn) 
            ? parseInt(nbCommandesAn, 10) 
            : CONFIG.DEFAULT_ORDERS_YEAR;
        
        var result = personnes * heures * commandes * CONFIG.CALC.TAUX_HORAIRE * CONFIG.CALC.REDUCTION_TEMPS;
        
        return Math.round(result);
    }
    
    /**
     * Calcul des économies sur l'optimisation produits
     * Formule: nbEmployes × COUT_EMPLOYE_ARTICLES × OPTIMISATION_PRODUITS
     * @param {number} nbEmployes - Nombre d'employés
     * @returns {number} Économies produits en dollars
     */
    function calcProduits(nbEmployes) {
        var employes = safeInt(
            nbEmployes,
            CONFIG.LIMITS.NB_EMPLOYES.MIN,
            CONFIG.LIMITS.NB_EMPLOYES.MAX,
            CONFIG.LIMITS.NB_EMPLOYES.DEFAULT
        );
        
        var result = employes * CONFIG.CALC.COUT_EMPLOYE_ARTICLES * CONFIG.CALC.OPTIMISATION_PRODUITS;
        
        return Math.round(result);
    }
    
    /**
     * Calcul des économies sur la réduction des erreurs
     * Formule: nbEmployes × COUT_EMPLOYE_ARTICLES × REDUCTION_ERREURS
     * @param {number} nbEmployes - Nombre d'employés
     * @returns {number} Économies erreurs en dollars
     */
    function calcErreurs(nbEmployes) {
        var employes = safeInt(
            nbEmployes,
            CONFIG.LIMITS.NB_EMPLOYES.MIN,
            CONFIG.LIMITS.NB_EMPLOYES.MAX,
            CONFIG.LIMITS.NB_EMPLOYES.DEFAULT
        );
        
        var result = employes * CONFIG.CALC.COUT_EMPLOYE_ARTICLES * CONFIG.CALC.REDUCTION_ERREURS;
        
        return Math.round(result);
    }
    
    /**
     * Applique le plancher d'économies garanti selon la taille de l'équipe
     * @param {number} total - Total calculé des économies
     * @param {number} nbEmployes - Nombre d'employés
     * @returns {Object} {value: number, applied: boolean, montant: number}
     */
    function applyPlancher(total, nbEmployes) {
        var employes = safeInt(
            nbEmployes,
            CONFIG.LIMITS.NB_EMPLOYES.MIN,
            CONFIG.LIMITS.NB_EMPLOYES.MAX,
            CONFIG.LIMITS.NB_EMPLOYES.DEFAULT
        );
        
        var totalValue = typeof total === 'number' && isFinite(total) ? total : 0;
        
        var plancher;
        
        // Déterminer le plancher selon la taille de l'équipe
        if (employes >= CONFIG.PLANCHERS.GRAND.MIN_EMPLOYES) {
            plancher = CONFIG.PLANCHERS.GRAND.MONTANT;
        } else if (employes >= CONFIG.PLANCHERS.MOYEN.MIN_EMPLOYES) {
            plancher = CONFIG.PLANCHERS.MOYEN.MONTANT;
        } else {
            plancher = CONFIG.PLANCHERS.PETIT.MONTANT;
        }
        
        // Appliquer le plancher si le total est inférieur
        if (totalValue < plancher) {
            return {
                value: plancher,
                applied: true,
                montant: plancher
            };
        }
        
        return {
            value: Math.round(totalValue),
            applied: false,
            montant: plancher
        };
    }
    
    /**
     * Calcul complet des économies
     * @param {Object} inputs - Paramètres d'entrée
     * @param {number} inputs.nbPersonnes - Nombre de personnes gérant les commandes
     * @param {number} inputs.heuresCommande - Heures par commande
     * @param {number} inputs.nbCommandesAn - Nombre de commandes par an
     * @param {number} inputs.nbEmployes - Nombre d'employés
     * @returns {Object} Résultats détaillés
     */
    function calculate(inputs) {
        // Valider et extraire les inputs
        var params = inputs || {};
        
        var nbPersonnes = safeInt(
            params.nbPersonnes,
            CONFIG.LIMITS.NB_PERSONNES.MIN,
            CONFIG.LIMITS.NB_PERSONNES.MAX,
            CONFIG.LIMITS.NB_PERSONNES.DEFAULT
        );
        
        var heuresCommande = safeFloat(
            params.heuresCommande,
            CONFIG.LIMITS.HEURES_COMMANDE.MIN,
            CONFIG.LIMITS.HEURES_COMMANDE.MAX,
            CONFIG.LIMITS.HEURES_COMMANDE.DEFAULT
        );
        
        var nbCommandesAn = isValidOrdersYear(params.nbCommandesAn)
            ? parseInt(params.nbCommandesAn, 10)
            : CONFIG.DEFAULT_ORDERS_YEAR;
        
        var nbEmployes = safeInt(
            params.nbEmployes,
            CONFIG.LIMITS.NB_EMPLOYES.MIN,
            CONFIG.LIMITS.NB_EMPLOYES.MAX,
            CONFIG.LIMITS.NB_EMPLOYES.DEFAULT
        );
        
        // Calculer chaque catégorie
        var admin = calcAdmin(nbPersonnes, heuresCommande, nbCommandesAn);
        var produits = calcProduits(nbEmployes);
        var erreurs = calcErreurs(nbEmployes);
        
        // Calculer le total brut
        var rawTotal = admin + produits + erreurs;
        
        // Appliquer le plancher
        var plancherResult = applyPlancher(rawTotal, nbEmployes);
        
        return {
            admin: admin,
            produits: produits,
            erreurs: erreurs,
            rawTotal: rawTotal,
            total: plancherResult.value,
            plancherApplied: plancherResult.applied,
            plancherMontant: plancherResult.montant,
            inputs: {
                nbPersonnes: nbPersonnes,
                heuresCommande: heuresCommande,
                nbCommandesAn: nbCommandesAn,
                nbEmployes: nbEmployes
            }
        };
    }
    
    /**
     * Formate un nombre en devise canadienne
     * @param {number} value - Valeur à formater
     * @returns {string} Valeur formatée avec $ et espaces
     */
    function formatCurrency(value) {
        var num = typeof value === 'number' && isFinite(value) ? value : 0;
        var rounded = Math.round(num);
        
        // Formater avec séparateur de milliers (espace)
        var formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        
        return formatted + ' $';
    }
    
    // API publique
    return {
        safeInt: safeInt,
        safeFloat: safeFloat,
        isValidOrdersYear: isValidOrdersYear,
        calcAdmin: calcAdmin,
        calcProduits: calcProduits,
        calcErreurs: calcErreurs,
        applyPlancher: applyPlancher,
        calculate: calculate,
        formatCurrency: formatCurrency
    };
    
})();
