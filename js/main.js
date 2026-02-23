/**
 * APPROVIZ ESTIMATEUR V2 - MAIN
 * Logique UI et gestion de l'application
 * Dépend de: config.js, model.js
 */

'use strict';

/**
 * État centralisé de l'application
 */
var AppState = {
    currentStep: 1,
    nbPersonnes: CONFIG.LIMITS.NB_PERSONNES.DEFAULT,
    heuresCommande: CONFIG.LIMITS.HEURES_COMMANDE.DEFAULT,
    nbCommandesAn: CONFIG.DEFAULT_ORDERS_YEAR,
    selectedProducts: [],
    nbEmployes: CONFIG.LIMITS.NB_EMPLOYES.DEFAULT,
    result: null
};

/**
 * Cache des éléments DOM fréquemment utilisés
 */
var DOMCache = {};

/**
 * Application principale
 */
var App = (function() {
    
    /**
     * Initialise le cache DOM
     */
    function initDOMCache() {
        DOMCache = {
            // Progress bar
            progressSteps: document.querySelectorAll('.progress__step'),
            progressFills: document.querySelectorAll('.progress__line-fill'),
            
            // Form steps
            formSteps: document.querySelectorAll('.form-step'),
            step1: document.getElementById('step-1'),
            step2: document.getElementById('step-2'),
            step3: document.getElementById('step-3'),
            
            // Step 1 inputs
            nbPersonnesInput: document.getElementById('nb-personnes'),
            heuresSlider: document.getElementById('heures-commande-slider'),
            heuresInput: document.getElementById('heures-commande'),
            commandesGroup: document.getElementById('commandes-annee-group'),
            
            // Step 2 inputs
            productsGrid: document.getElementById('products-grid'),
            productsHint: document.getElementById('products-hint'),
            productsCount: document.querySelector('.products-hint__count'),
            nbEmployesInput: document.getElementById('nb-employes'),
            
            // Results
            totalSavings: document.getElementById('total-savings'),
            adminSavings: document.getElementById('admin-savings'),
            productSavings: document.getElementById('product-savings'),
            errorSavings: document.getElementById('error-savings'),
            resultsBadge: document.getElementById('results-badge'),
            resultsSummary: document.getElementById('results-summary'),
            summaryPersonnes: document.getElementById('summary-personnes'),
            summaryCommandes: document.getElementById('summary-commandes'),
            summaryHeures: document.getElementById('summary-heures'),
            summaryEmployes: document.getElementById('summary-employes'),
            
            // Buttons
            btnResults: document.getElementById('btn-results'),
            btnRestart: document.getElementById('btn-restart'),
            
            // Hero KPIs
            heroKpis: document.querySelectorAll('.hero__kpi-value'),
            
            // Steppers
            stepperBtns: document.querySelectorAll('.stepper__btn')
        };
    }
    
    /**
     * Initialise l'application
     */
    function init() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onDOMReady);
        } else {
            onDOMReady();
        }
    }
    
    /**
     * Callback quand le DOM est prêt
     */
    function onDOMReady() {
        initDOMCache();
        initStepper();
        initSlider();
        initChips();
        initProducts();
        initNavigation();
        initHeroAnimation();
        syncStateFromDOM();
    }
    
    /**
     * Synchronise l'état initial depuis le DOM
     */
    function syncStateFromDOM() {
        // Nb personnes
        if (DOMCache.nbPersonnesInput) {
            AppState.nbPersonnes = Model.safeInt(
                DOMCache.nbPersonnesInput.value,
                CONFIG.LIMITS.NB_PERSONNES.MIN,
                CONFIG.LIMITS.NB_PERSONNES.MAX,
                CONFIG.LIMITS.NB_PERSONNES.DEFAULT
            );
        }
        
        // Heures commande
        if (DOMCache.heuresInput) {
            AppState.heuresCommande = Model.safeFloat(
                DOMCache.heuresInput.value,
                CONFIG.LIMITS.HEURES_COMMANDE.MIN,
                CONFIG.LIMITS.HEURES_COMMANDE.MAX,
                CONFIG.LIMITS.HEURES_COMMANDE.DEFAULT
            );
        }
        
        // Commandes par an (chip active)
        if (DOMCache.commandesGroup) {
            var activeChip = DOMCache.commandesGroup.querySelector('.chip.active');
            if (activeChip && activeChip.dataset.value) {
                var val = parseInt(activeChip.dataset.value, 10);
                if (Model.isValidOrdersYear(val)) {
                    AppState.nbCommandesAn = val;
                }
            }
        }
        
        // Nb employés
        if (DOMCache.nbEmployesInput) {
            AppState.nbEmployes = Model.safeInt(
                DOMCache.nbEmployesInput.value,
                CONFIG.LIMITS.NB_EMPLOYES.MIN,
                CONFIG.LIMITS.NB_EMPLOYES.MAX,
                CONFIG.LIMITS.NB_EMPLOYES.DEFAULT
            );
        }
    }
    
    /**
     * Initialise les boutons stepper (+/-)
     */
    function initStepper() {
        if (!DOMCache.stepperBtns) return;
        
        DOMCache.stepperBtns.forEach(function(btn) {
            btn.addEventListener('click', handleStepperClick);
        });
        
        // Écouter les changements directs sur l'input
        if (DOMCache.nbPersonnesInput) {
            DOMCache.nbPersonnesInput.addEventListener('change', handleNbPersonnesChange);
            DOMCache.nbPersonnesInput.addEventListener('input', handleNbPersonnesChange);
        }
    }
    
    /**
     * Gère le clic sur un bouton stepper
     * @param {Event} e - Événement click
     */
    function handleStepperClick(e) {
        var btn = e.currentTarget;
        var action = btn.dataset.action;
        var targetId = btn.dataset.target;
        var input = document.getElementById(targetId);
        
        if (!input) return;
        
        var currentValue = Model.safeInt(
            input.value,
            CONFIG.LIMITS.NB_PERSONNES.MIN,
            CONFIG.LIMITS.NB_PERSONNES.MAX,
            CONFIG.LIMITS.NB_PERSONNES.DEFAULT
        );
        
        var newValue;
        if (action === 'increase') {
            newValue = Math.min(currentValue + 1, CONFIG.LIMITS.NB_PERSONNES.MAX);
        } else if (action === 'decrease') {
            newValue = Math.max(currentValue - 1, CONFIG.LIMITS.NB_PERSONNES.MIN);
        } else {
            return;
        }
        
        input.value = newValue;
        AppState.nbPersonnes = newValue;
    }
    
    /**
     * Gère le changement du nombre de personnes
     * @param {Event} e - Événement change/input
     */
    function handleNbPersonnesChange(e) {
        var value = Model.safeInt(
            e.target.value,
            CONFIG.LIMITS.NB_PERSONNES.MIN,
            CONFIG.LIMITS.NB_PERSONNES.MAX,
            CONFIG.LIMITS.NB_PERSONNES.DEFAULT
        );
        
        e.target.value = value;
        AppState.nbPersonnes = value;
    }
    
    /**
     * Initialise le slider et l'input des heures
     */
    function initSlider() {
        if (!DOMCache.heuresSlider || !DOMCache.heuresInput) return;
        
        // Synchroniser slider → input
        DOMCache.heuresSlider.addEventListener('input', function(e) {
            var value = Model.safeFloat(
                e.target.value,
                CONFIG.LIMITS.HEURES_COMMANDE.MIN,
                CONFIG.LIMITS.HEURES_COMMANDE.MAX,
                CONFIG.LIMITS.HEURES_COMMANDE.DEFAULT
            );
            
            DOMCache.heuresInput.value = value;
            AppState.heuresCommande = value;
        });
        
        // Synchroniser input → slider
        DOMCache.heuresInput.addEventListener('change', function(e) {
            var value = Model.safeFloat(
                e.target.value,
                CONFIG.LIMITS.HEURES_COMMANDE.MIN,
                CONFIG.LIMITS.HEURES_COMMANDE.MAX,
                CONFIG.LIMITS.HEURES_COMMANDE.DEFAULT
            );
            
            e.target.value = value;
            DOMCache.heuresSlider.value = value;
            AppState.heuresCommande = value;
        });
        
        DOMCache.heuresInput.addEventListener('input', function(e) {
            var value = Model.safeFloat(
                e.target.value,
                CONFIG.LIMITS.HEURES_COMMANDE.MIN,
                CONFIG.LIMITS.HEURES_COMMANDE.MAX,
                CONFIG.LIMITS.HEURES_COMMANDE.DEFAULT
            );
            
            DOMCache.heuresSlider.value = value;
            AppState.heuresCommande = value;
        });
    }
    
    /**
     * Initialise les chips de sélection des commandes
     */
    function initChips() {
        if (!DOMCache.commandesGroup) return;
        
        var chips = DOMCache.commandesGroup.querySelectorAll('.chip');
        
        chips.forEach(function(chip) {
            chip.addEventListener('click', function(e) {
                handleChipClick(e, chips);
            });
            
            // Support clavier
            chip.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleChipClick(e, chips);
                }
            });
        });
    }
    
    /**
     * Gère le clic sur un chip
     * @param {Event} e - Événement
     * @param {NodeList} chips - Liste des chips
     */
    function handleChipClick(e, chips) {
        var chip = e.currentTarget;
        var value = parseInt(chip.dataset.value, 10);
        
        if (!Model.isValidOrdersYear(value)) return;
        
        // Désélectionner tous les chips
        chips.forEach(function(c) {
            c.classList.remove('active');
            c.setAttribute('aria-checked', 'false');
            c.setAttribute('tabindex', '-1');
        });
        
        // Sélectionner le chip cliqué
        chip.classList.add('active');
        chip.setAttribute('aria-checked', 'true');
        chip.setAttribute('tabindex', '0');
        
        AppState.nbCommandesAn = value;
    }
    
    /**
     * Initialise la grille de produits
     */
    function initProducts() {
        if (!DOMCache.productsGrid) return;
        
        var productCards = DOMCache.productsGrid.querySelectorAll('.product-card');
        
        productCards.forEach(function(card) {
            card.addEventListener('click', function() {
                toggleProduct(card);
            });
            
            // Support clavier
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleProduct(card);
                }
            });
        });
    }
    
    /**
     * Toggle la sélection d'un produit
     * @param {HTMLElement} card - Carte produit
     */
    function toggleProduct(card) {
        var productId = card.dataset.product;
        if (!productId) return;
        
        var isSelected = card.classList.contains('selected');
        
        if (isSelected) {
            // Désélectionner
            card.classList.remove('selected');
            card.setAttribute('aria-checked', 'false');
            var index = AppState.selectedProducts.indexOf(productId);
            if (index > -1) {
                AppState.selectedProducts.splice(index, 1);
            }
        } else {
            // Sélectionner
            card.classList.add('selected');
            card.setAttribute('aria-checked', 'true');
            if (AppState.selectedProducts.indexOf(productId) === -1) {
                AppState.selectedProducts.push(productId);
            }
        }
        
        // Mettre à jour le compteur
        updateProductsCount();
    }
    
    /**
     * Met à jour le compteur de produits sélectionnés
     */
    function updateProductsCount() {
        if (DOMCache.productsCount) {
            DOMCache.productsCount.textContent = AppState.selectedProducts.length;
        }
    }
    
    /**
     * Initialise la navigation entre étapes
     */
    function initNavigation() {
        // Boutons "Suivant"
        var nextBtns = document.querySelectorAll('.btn--next');
        nextBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                nextStep();
            });
        });
        
        // Boutons "Précédent"
        var prevBtns = document.querySelectorAll('.btn--prev');
        prevBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                prevStep();
            });
        });
        
        // Bouton "Voir les résultats"
        if (DOMCache.btnResults) {
            DOMCache.btnResults.addEventListener('click', function() {
                showResults();
            });
        }
        
        // Bouton "Recommencer"
        if (DOMCache.btnRestart) {
            DOMCache.btnRestart.addEventListener('click', function() {
                restart();
            });
        }
    }
    
    /**
     * Valide l'étape 1
     * @returns {boolean} True si valide
     */
    function validateStep1() {
        // Valider nb personnes
        var nbPersonnes = Model.safeInt(
            DOMCache.nbPersonnesInput ? DOMCache.nbPersonnesInput.value : AppState.nbPersonnes,
            CONFIG.LIMITS.NB_PERSONNES.MIN,
            CONFIG.LIMITS.NB_PERSONNES.MAX,
            -1
        );
        
        if (nbPersonnes < CONFIG.LIMITS.NB_PERSONNES.MIN || 
            nbPersonnes > CONFIG.LIMITS.NB_PERSONNES.MAX) {
            return false;
        }
        
        // Valider heures commande
        var heures = Model.safeFloat(
            DOMCache.heuresInput ? DOMCache.heuresInput.value : AppState.heuresCommande,
            CONFIG.LIMITS.HEURES_COMMANDE.MIN,
            CONFIG.LIMITS.HEURES_COMMANDE.MAX,
            -1
        );
        
        if (heures < CONFIG.LIMITS.HEURES_COMMANDE.MIN || 
            heures > CONFIG.LIMITS.HEURES_COMMANDE.MAX) {
            return false;
        }
        
        // Valider commandes par an
        if (!Model.isValidOrdersYear(AppState.nbCommandesAn)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Valide l'étape 2
     * @returns {boolean} True si valide
     */
    function validateStep2() {
        // Au moins 1 produit sélectionné
        if (AppState.selectedProducts.length < 1) {
            return false;
        }
        
        // Valider nb employés
        var nbEmployes = Model.safeInt(
            DOMCache.nbEmployesInput ? DOMCache.nbEmployesInput.value : AppState.nbEmployes,
            CONFIG.LIMITS.NB_EMPLOYES.MIN,
            CONFIG.LIMITS.NB_EMPLOYES.MAX,
            -1
        );
        
        if (nbEmployes < CONFIG.LIMITS.NB_EMPLOYES.MIN || 
            nbEmployes > CONFIG.LIMITS.NB_EMPLOYES.MAX) {
            return false;
        }
        
        // Mettre à jour l'état
        AppState.nbEmployes = nbEmployes;
        
        return true;
    }
    
    /**
     * Passe à l'étape suivante
     */
    function nextStep() {
        var valid = false;
        
        if (AppState.currentStep === 1) {
            valid = validateStep1();
        } else if (AppState.currentStep === 2) {
            valid = validateStep2();
        }
        
        if (valid && AppState.currentStep < CONFIG.STEPS.TOTAL) {
            goToStep(AppState.currentStep + 1);
        }
    }
    
    /**
     * Revient à l'étape précédente
     */
    function prevStep() {
        if (AppState.currentStep > 1) {
            goToStep(AppState.currentStep - 1);
        }
    }
    
    /**
     * Affiche les résultats
     */
    function showResults() {
        if (!validateStep2()) {
            return;
        }
        
        // Synchroniser l'état depuis le DOM
        syncStateFromDOM();
        
        // Mettre à jour nb employés
        if (DOMCache.nbEmployesInput) {
            AppState.nbEmployes = Model.safeInt(
                DOMCache.nbEmployesInput.value,
                CONFIG.LIMITS.NB_EMPLOYES.MIN,
                CONFIG.LIMITS.NB_EMPLOYES.MAX,
                CONFIG.LIMITS.NB_EMPLOYES.DEFAULT
            );
        }
        
        // Calculer les résultats
        AppState.result = Model.calculate({
            nbPersonnes: AppState.nbPersonnes,
            heuresCommande: AppState.heuresCommande,
            nbCommandesAn: AppState.nbCommandesAn,
            nbEmployes: AppState.nbEmployes
        });
        
        // Afficher les résultats
        displayResults(AppState.result);
        
        // Aller à l'étape 3
        goToStep(3);
    }
    
    /**
     * Navigue vers une étape spécifique
     * @param {number} step - Numéro de l'étape (1-3)
     */
    function goToStep(step) {
        var targetStep = Model.safeInt(step, 1, CONFIG.STEPS.TOTAL, 1);
        
        // Cacher toutes les étapes
        DOMCache.formSteps.forEach(function(formStep) {
            formStep.classList.remove('active');
        });
        
        // Afficher l'étape cible
        var targetElement = document.getElementById('step-' + targetStep);
        if (targetElement) {
            targetElement.classList.add('active');
        }
        
        // Mettre à jour la progress bar
        updateProgressBar(targetStep);
        
        // Mettre à jour l'état
        AppState.currentStep = targetStep;
        
        // Scroll vers l'estimateur
        var estimateur = document.getElementById('estimateur');
        if (estimateur) {
            estimateur.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    /**
     * Met à jour la progress bar
     * @param {number} step - Étape courante
     */
    function updateProgressBar(step) {
        DOMCache.progressSteps.forEach(function(progressStep, index) {
            var stepNum = index + 1;
            
            progressStep.classList.remove('active', 'completed');
            
            if (stepNum < step) {
                progressStep.classList.add('completed');
            } else if (stepNum === step) {
                progressStep.classList.add('active');
            }
        });
        
        // Mettre à jour les lignes de progression
        DOMCache.progressFills.forEach(function(fill, index) {
            if (index < step - 1) {
                fill.style.width = '100%';
            } else {
                fill.style.width = '0%';
            }
        });
    }
    
    /**
     * Affiche les résultats calculés
     * @param {Object} result - Résultats du calcul
     */
    function displayResults(result) {
        if (!result) return;
        
        // Afficher les valeurs
        if (DOMCache.totalSavings) {
            DOMCache.totalSavings.textContent = Model.formatCurrency(result.total);
        }
        
        if (DOMCache.adminSavings) {
            DOMCache.adminSavings.textContent = Model.formatCurrency(result.admin);
        }
        
        if (DOMCache.productSavings) {
            DOMCache.productSavings.textContent = Model.formatCurrency(result.produits);
        }
        
        if (DOMCache.errorSavings) {
            DOMCache.errorSavings.textContent = Model.formatCurrency(result.erreurs);
        }
        
        // Afficher/cacher le badge plancher
        if (DOMCache.resultsBadge) {
            if (result.plancherApplied) {
                DOMCache.resultsBadge.classList.add('visible');
            } else {
                DOMCache.resultsBadge.classList.remove('visible');
            }
        }
        
        // Mettre à jour le résumé
        if (DOMCache.summaryPersonnes) {
            DOMCache.summaryPersonnes.textContent = result.inputs.nbPersonnes;
        }
        
        if (DOMCache.summaryCommandes) {
            DOMCache.summaryCommandes.textContent = result.inputs.nbCommandesAn;
        }
        
        if (DOMCache.summaryHeures) {
            DOMCache.summaryHeures.textContent = result.inputs.heuresCommande;
        }
        
        if (DOMCache.summaryEmployes) {
            DOMCache.summaryEmployes.textContent = result.inputs.nbEmployes;
        }
    }
    
    /**
     * Recommence l'estimation
     */
    function restart() {
        // Réinitialiser l'état
        AppState.currentStep = 1;
        AppState.nbPersonnes = CONFIG.LIMITS.NB_PERSONNES.DEFAULT;
        AppState.heuresCommande = CONFIG.LIMITS.HEURES_COMMANDE.DEFAULT;
        AppState.nbCommandesAn = CONFIG.DEFAULT_ORDERS_YEAR;
        AppState.selectedProducts = [];
        AppState.nbEmployes = CONFIG.LIMITS.NB_EMPLOYES.DEFAULT;
        AppState.result = null;
        
        // Réinitialiser les inputs
        if (DOMCache.nbPersonnesInput) {
            DOMCache.nbPersonnesInput.value = CONFIG.LIMITS.NB_PERSONNES.DEFAULT;
        }
        
        if (DOMCache.heuresSlider) {
            DOMCache.heuresSlider.value = CONFIG.LIMITS.HEURES_COMMANDE.DEFAULT;
        }
        
        if (DOMCache.heuresInput) {
            DOMCache.heuresInput.value = CONFIG.LIMITS.HEURES_COMMANDE.DEFAULT;
        }
        
        if (DOMCache.nbEmployesInput) {
            DOMCache.nbEmployesInput.value = CONFIG.LIMITS.NB_EMPLOYES.DEFAULT;
        }
        
        // Réinitialiser les chips
        if (DOMCache.commandesGroup) {
            var chips = DOMCache.commandesGroup.querySelectorAll('.chip');
            chips.forEach(function(chip) {
                chip.classList.remove('active');
                chip.setAttribute('aria-checked', 'false');
                chip.setAttribute('tabindex', '-1');
                
                if (parseInt(chip.dataset.value, 10) === CONFIG.DEFAULT_ORDERS_YEAR) {
                    chip.classList.add('active');
                    chip.setAttribute('aria-checked', 'true');
                    chip.setAttribute('tabindex', '0');
                }
            });
        }
        
        // Réinitialiser les produits
        if (DOMCache.productsGrid) {
            var productCards = DOMCache.productsGrid.querySelectorAll('.product-card');
            productCards.forEach(function(card) {
                card.classList.remove('selected');
                card.setAttribute('aria-checked', 'false');
            });
        }
        
        updateProductsCount();
        
        // Retourner à l'étape 1
        goToStep(1);
    }
    
    /**
     * Initialise l'animation des KPIs du hero
     */
    function initHeroAnimation() {
        if (!DOMCache.heroKpis || DOMCache.heroKpis.length === 0) return;
        
        // Observer pour déclencher l'animation au scroll
        var observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };
        
        var hasAnimated = false;
        
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    animateKPIs();
                }
            });
        }, observerOptions);
        
        // Observer le premier KPI
        if (DOMCache.heroKpis[0]) {
            observer.observe(DOMCache.heroKpis[0]);
        }
    }
    
    /**
     * Anime les compteurs KPI
     */
    function animateKPIs() {
        DOMCache.heroKpis.forEach(function(kpi) {
            var target = parseInt(kpi.dataset.target, 10);
            if (isNaN(target)) return;
            
            var duration = 2000; // 2 secondes
            var startTime = null;
            var startValue = 0;
            
            function animate(currentTime) {
                if (!startTime) startTime = currentTime;
                var elapsed = currentTime - startTime;
                var progress = Math.min(elapsed / duration, 1);
                
                // Easing out cubic
                var easedProgress = 1 - Math.pow(1 - progress, 3);
                
                var currentValue = Math.round(startValue + (target - startValue) * easedProgress);
                kpi.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }
            
            requestAnimationFrame(animate);
        });
    }
    
    // API publique
    return {
        init: init,
        goToStep: goToStep,
        validateStep1: validateStep1,
        validateStep2: validateStep2,
        nextStep: nextStep,
        prevStep: prevStep,
        showResults: showResults,
        restart: restart,
        getState: function() { return AppState; }
    };
    
})();

// Démarrer l'application
App.init();
