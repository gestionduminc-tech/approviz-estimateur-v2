/**
 * APPROVIZ ESTIMATEUR V2 - CONFIGURATION
 * Fichier de constantes et configuration
 * IMPORTANT: Ne pas modifier sans validation
 */

'use strict';

/**
 * Configuration principale de l'application
 * Toutes les valeurs sont gelées pour éviter les modifications accidentelles
 */
var CONFIG = Object.freeze({
    // Limites des champs de saisie
    LIMITS: Object.freeze({
        NB_PERSONNES: Object.freeze({
            MIN: 1,
            MAX: 20,
            DEFAULT: 1
        }),
        HEURES_COMMANDE: Object.freeze({
            MIN: 0.5,
            MAX: 20,
            STEP: 0.5,
            DEFAULT: 3
        }),
        NB_EMPLOYES: Object.freeze({
            MIN: 1,
            MAX: 9999,
            DEFAULT: 25
        })
    }),

    // Valeurs autorisées pour le nombre de commandes par année (whitelist)
    ALLOWED_ORDERS_YEAR: Object.freeze([50, 100, 250, 500, 1000, 2000]),
    DEFAULT_ORDERS_YEAR: 250,

    // Paramètres de calcul des économies
    CALC: Object.freeze({
        // Taux horaire moyen pour le calcul du temps admin ($/h)
        TAUX_HORAIRE: 28,
        // Pourcentage de réduction du temps admin avec Approviz
        REDUCTION_TEMPS: 0.70,
        // Coût moyen par employé pour les articles promo ($/employé/an)
        COUT_EMPLOYE_ARTICLES: 35,
        // Pourcentage d'optimisation sur les produits
        OPTIMISATION_PRODUITS: 0.13,
        // Pourcentage de réduction des erreurs
        REDUCTION_ERREURS: 0.03
    }),

    // Planchers d'économies garantis selon la taille de l'équipe
    PLANCHERS: Object.freeze({
        GRAND: Object.freeze({ MIN_EMPLOYES: 50, MONTANT: 6000 }),
        MOYEN: Object.freeze({ MIN_EMPLOYES: 20, MONTANT: 4000 }),
        PETIT: Object.freeze({ MIN_EMPLOYES: 1, MONTANT: 3000 })
    }),

    // Catalogue de produits
    PRODUCTS: Object.freeze({
        'tshirt': Object.freeze({
            id: 'tshirt',
            name: 'T-Shirt',
            description: 'Coton confortable, idéal été',
            image: 'assets/images/prod-tshirt-opt.webp'
        }),
        'hoodie': Object.freeze({
            id: 'hoodie',
            name: 'Hoodie',
            description: 'Chaud et stylé, toutes saisons',
            image: 'assets/images/prod-hoodie-opt.webp'
        }),
        'crewneck': Object.freeze({
            id: 'crewneck',
            name: 'Crewneck',
            description: 'Col rond classique et pro',
            image: 'assets/images/prod-crewneck-opt.webp'
        }),
        'manteau': Object.freeze({
            id: 'manteau',
            name: 'Manteau',
            description: 'Protection hiver complète',
            image: 'assets/images/prod-manteau-opt.webp'
        }),
        'manche-longue': Object.freeze({
            id: 'manche-longue',
            name: 'Manche longue',
            description: 'Polyvalent mi-saison',
            image: 'assets/images/prod-manche-longue-opt.webp'
        }),
        'hoodie-zipper': Object.freeze({
            id: 'hoodie-zipper',
            name: 'Hoodie Zipper',
            description: 'Fermeture éclair pratique',
            image: 'assets/images/prod-hoodie-zipper-opt.webp'
        }),
        'tuque': Object.freeze({
            id: 'tuque',
            name: 'Tuque',
            description: 'Accessoire hiver essentiel',
            image: 'assets/images/prod-tuque-opt.webp'
        }),
        'casquette': Object.freeze({
            id: 'casquette',
            name: 'Casquette',
            description: 'Visibilité de marque',
            image: 'assets/images/prod-casquette-opt.webp'
        })
    }),

    // Configuration des étapes du formulaire
    STEPS: Object.freeze({
        STEP_1: 1,
        STEP_2: 2,
        STEP_3: 3,
        TOTAL: 3
    }),

    // Liens externes
    LINKS: Object.freeze({
        CALENDLY: 'https://calendly.com/approviz/demo'
    })
});

/**
 * Messages d'erreur pour la validation
 */
var MESSAGES = Object.freeze({
    ERREUR_VALEUR_INVALIDE: 'Valeur invalide',
    ERREUR_HORS_LIMITES: 'Valeur hors des limites autorisées',
    ERREUR_COMMANDES_NON_AUTORISE: 'Nombre de commandes non autorisé'
});