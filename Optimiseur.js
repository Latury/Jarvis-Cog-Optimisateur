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
// ========================================
// 3. ALGORITHME GÉNÉTIQUE
// ========================================

/**
 * Génère une solution aléatoire
 */
function genererSolutionAleatoire(engrenages) {
  const grille = new Grille();
  const engrenagesMelanges = [...engrenages].sort(() => Math.random() - 0.5);

  let index = 0;
  for (
    let y = 0;
    y < CONFIG_GRILLE.hauteur && index < engrenagesMelanges.length;
    y++
  ) {
    for (
      let x = 0;
      x < CONFIG_GRILLE.largeur && index < engrenagesMelanges.length;
      x++
    ) {
      grille.placerEngrenage(x, y, engrenagesMelanges[index]);
      index++;
    }
  }

  return new Solution(grille);
}

/**
 * Croisement entre deux solutions
 */
function croiser(parent1, parent2) {
  const grille = new Grille();
  const pointCoupure = Math.floor(Math.random() * CONFIG_GRILLE.hauteur);

  for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
    for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
      const parent = y < pointCoupure ? parent1 : parent2;
      const caseParent = parent.grille.obtenirCase(x, y);

      if (caseParent && caseParent.engrenage) {
        grille.placerEngrenage(x, y, caseParent.engrenage);
      }
    }
  }

  return new Solution(grille);
}

/**
 * Mutation d'une solution
 */
function muter(solution) {
  const grille = solution.grille.cloner();

  // Choisit deux positions aléatoires et échange les engrenages
  const x1 = Math.floor(Math.random() * CONFIG_GRILLE.largeur);
  const y1 = Math.floor(Math.random() * CONFIG_GRILLE.hauteur);
  const x2 = Math.floor(Math.random() * CONFIG_GRILLE.largeur);
  const y2 = Math.floor(Math.random() * CONFIG_GRILLE.hauteur);

  const case1 = grille.obtenirCase(x1, y1);
  const case2 = grille.obtenirCase(x2, y2);

  if (case1 && case2) {
    const temp = case1.engrenage;
    case1.engrenage = case2.engrenage;
    case2.engrenage = temp;
  }

  return new Solution(grille);
}

/**
 * Sélection par tournoi
 */
function selectionTournoi(population, tailleTournoi = 3) {
  let meilleur = population[Math.floor(Math.random() * population.length)];

  for (let i = 1; i < tailleTournoi; i++) {
    const concurrent =
      population[Math.floor(Math.random() * population.length)];
    if (concurrent.fitness > meilleur.fitness) {
      meilleur = concurrent;
    }
  }

  return meilleur;
}

/**
 * Fonction principale d'optimisation
 */
function optimiserPlacementCogs(engrenages, callbackProgression = null) {
  console.log("🧬 Démarrage de l'algorithme génétique");

  // Initialisation de la population
  let population = [];
  for (let i = 0; i < CONFIG_ALGO_GENETIQUE.taillePopulation; i++) {
    population.push(genererSolutionAleatoire(engrenages));
  }

  let meilleureSolution = population[0];

  // Évolution
  for (
    let generation = 0;
    generation < CONFIG_ALGO_GENETIQUE.nombreGenerations;
    generation++
  ) {
    // Tri par fitness
    population.sort((a, b) => b.fitness - a.fitness);

    // Mise à jour de la meilleure solution
    if (population[0].fitness > meilleureSolution.fitness) {
      meilleureSolution = population[0];
    }

    // Callback de progression
    if (callbackProgression && generation % 10 === 0) {
      const pourcentage = Math.floor(
        (generation / CONFIG_ALGO_GENETIQUE.nombreGenerations) * 100
      );
      callbackProgression(pourcentage, meilleureSolution);
    }

    // Création de la nouvelle génération
    const nouvellePopulation = [];

    // Élitisme : garde les meilleurs
    for (let i = 0; i < CONFIG_ALGO_GENETIQUE.tailleElite; i++) {
      nouvellePopulation.push(population[i]);
    }

    // Croisement et mutation
    while (nouvellePopulation.length < CONFIG_ALGO_GENETIQUE.taillePopulation) {
      const parent1 = selectionTournoi(population);
      const parent2 = selectionTournoi(population);

      let enfant;
      if (Math.random() < CONFIG_ALGO_GENETIQUE.tauxCroisement) {
        enfant = croiser(parent1, parent2);
      } else {
        enfant = parent1;
      }

      if (Math.random() < CONFIG_ALGO_GENETIQUE.tauxMutation) {
        enfant = muter(enfant);
      }

      nouvellePopulation.push(enfant);
    }

    population = nouvellePopulation;
  }

  // Tri final
  population.sort((a, b) => b.fitness - a.fitness);

  console.log("✅ Algorithme génétique terminé");
  console.log(`🏆 Meilleur score: ${population[0].fitness.toFixed(2)}`);

  return population;
}

// Export pour utilisation dans le navigateur
if (typeof window !== "undefined") {
  window.optimiserPlacementCogs = optimiserPlacementCogs;
}

console.log("✅ Optimiseur.js chargé correctement !");
