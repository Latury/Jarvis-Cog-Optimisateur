/**
 * ========================================
 * JARVIS COG OPTIMISATEUR - SOLVEUR v2.0
 * ========================================
 *
 * Ce fichier contient l'algorithme d'optimisation pour les Cogs (engrenages)
 */

// ========================================
// 1. CONSTANTES ET CONFIGURATION
// ========================================

const CONFIG_GRILLE = {
  largeur: 12,
  hauteur: 8,
  tailleTotale: 96,
};

const CONFIG_ALGO_GENETIQUE = {
  taillePopulation: 100,
  nombreGenerations: 200,
  tauxMutation: 0.15,
  tauxCroisement: 0.7,
  tailleElite: 10,
};

const POIDS_OBJECTIFS = {
  buildRate: 1.0,
  expBonus: 1.0,
  flaggyRate: 1.0,
};

// ========================================
// 2. CLASSES DE BASE
// ========================================
// NOTE: La classe Engrenage est définie dans InventaireEngrenages.js

/**
 * Classe représentant une case de la grille
 */
class CaseGrille {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.engrenage = null;
    this.verrouillee = false;
  }

  estVide() {
    return this.engrenage === null;
  }

  placerEngrenage(engrenage) {
    if (!this.verrouillee) {
      this.engrenage = engrenage;
    }
  }

  retirerEngrenage() {
    if (!this.verrouillee) {
      this.engrenage = null;
    }
  }
}

/**
 * Classe représentant la grille complète
 */
class Grille {
  constructor() {
    this.cases = [];
    for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
      this.cases[y] = [];
      for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
        this.cases[y][x] = new CaseGrille(x, y);
      }
    }
  }

  obtenirCase(x, y) {
    if (
      x >= 0 &&
      x < CONFIG_GRILLE.largeur &&
      y >= 0 &&
      y < CONFIG_GRILLE.hauteur
    ) {
      return this.cases[y][x];
    }
    return null;
  }

  placerEngrenage(x, y, engrenage) {
    const caseGrille = this.obtenirCase(x, y);
    if (caseGrille && caseGrille.estVide()) {
      caseGrille.placerEngrenage(engrenage);
      return true;
    }
    return false;
  }

  retirerEngrenage(x, y) {
    const caseGrille = this.obtenirCase(x, y);
    if (caseGrille) {
      caseGrille.retirerEngrenage();
    }
  }

  calculerScore() {
    let buildRateTotal = 0;
    let expBonusTotal = 0;
    let flaggyRateTotal = 0;

    for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
      for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
        const caseGrille = this.cases[y][x];
        if (caseGrille.engrenage) {
          buildRateTotal += caseGrille.engrenage.buildRate || 0;
          expBonusTotal += caseGrille.engrenage.expBonus || 0;
          flaggyRateTotal += caseGrille.engrenage.flaggyRate || 0;
        }
      }
    }

    const scorePondere =
      buildRateTotal * POIDS_OBJECTIFS.buildRate +
      expBonusTotal * POIDS_OBJECTIFS.expBonus +
      flaggyRateTotal * POIDS_OBJECTIFS.flaggyRate;

    return {
      buildRate: buildRateTotal,
      expBonus: expBonusTotal,
      flaggyRate: flaggyRateTotal,
      scoreTotal: scorePondere,
    };
  }

  cloner() {
    const nouvelleGrille = new Grille();
    for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
      for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
        const caseOriginale = this.cases[y][x];
        const nouvelleCase = nouvelleGrille.cases[y][x];
        if (caseOriginale.engrenage) {
          nouvelleCase.placerEngrenage(caseOriginale.engrenage);
        }
        nouvelleCase.verrouillee = caseOriginale.verrouillee;
      }
    }
    return nouvelleGrille;
  }
}

/**
 * Classe représentant une solution
 */
class Solution {
  constructor(grille) {
    this.grille = grille;
    this.scores = grille.calculerScore();
    this.fitness = this.scores.scoreTotal;
  }

  mettreAJourScore() {
    this.scores = this.grille.calculerScore();
    this.fitness = this.scores.scoreTotal;
  }
}

console.log("✅ Optimiseur.js chargé correctement !");
