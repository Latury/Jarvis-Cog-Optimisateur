/**
 * ========================================
 * JARVIS COG OPTIMISATEUR - SOLVEUR v2.0
 * ========================================
 *
 * Ce fichier contient l'algorithme d'optimisation pour les Cogs (engrenages)
 * du jeu Legend of Idleon (Monde 3 - Construction).
 *
 * OBJECTIF :
 * Trouver le meilleur placement des Cogs sur une grille de 12x8 (96 cases)
 * pour maximiser :
 * - Build Rate (Vitesse de construction)
 * - EXP Bonus (Bonus d'expérience)
 * - Flaggy Rate (Taux de drapeaux)
 *
 * ALGORITHMES UTILISÉS :
 * 1. Algorithme Génétique (inspiration : sélection naturelle)
 * 2. CSP - Constraint Satisfaction Problem (contraintes intelligentes)
 *
 * AUTEUR : Latury
 * DATE : 26 octobre 2025
 * VERSION : 2.0.0
 */

// ========================================
// 1. CONSTANTES ET CONFIGURATION
// ========================================

/**
 * Configuration de la grille de construction
 */
const CONFIG_GRILLE = {
  largeur: 12, // Nombre de colonnes
  hauteur: 8, // Nombre de lignes
  tailleTotale: 96, // Total des cases (12 x 8)
};

/**
 * Configuration de l'algorithme génétique
 */
const CONFIG_ALGO_GENETIQUE = {
  taillePopulation: 100, // Nombre de solutions dans une génération
  nombreGenerations: 200, // Nombre de générations à calculer
  tauxMutation: 0.15, // Probabilité de mutation (15%)
  tauxCroisement: 0.7, // Probabilité de croisement (70%)
  tailleElite: 10, // Nombre des meilleures solutions à garder
};

/**
 * Poids pour calculer le score d'une solution
 * Le joueur peut modifier ces valeurs selon ses priorités
 */
const POIDS_OBJECTIFS = {
  buildRate: 1.0, // Importance de la vitesse de construction
  expBonus: 1.0, // Importance du bonus d'expérience
  flaggyRate: 1.0, // Importance du taux de drapeaux
};

// ========================================
// 2. CLASSES DE BASE
// ========================================

/**
 * Classe représentant un Engrenage (Cog)
 */
class Engrenage {
  /**
   * Crée un nouvel engrenage
   * @param {string} nom - Nom de l'engrenage (ex: "Nooby", "Decent", etc.)
   * @param {number} buildRate - Bonus de vitesse de construction
   * @param {number} expBonus - Bonus d'expérience
   * @param {number} flaggyRate - Bonus de taux de drapeaux
   * @param {number} niveau - Niveau requis pour utiliser cet engrenage
   */
  constructor(nom, buildRate, expBonus, flaggyRate, niveau) {
    this.nom = nom;
    this.buildRate = buildRate;
    this.expBonus = expBonus;
    this.flaggyRate = flaggyRate;
    this.niveau = niveau;

    // Identifiant unique pour chaque engrenage
    this.id = Engrenage.prochainId++;
  }

  /**
   * Calcule le score total de cet engrenage
   * @returns {number} Score pondéré
   */
  obtenirScore() {
    return (
      this.buildRate * POIDS_OBJECTIFS.buildRate +
      this.expBonus * POIDS_OBJECTIFS.expBonus +
      this.flaggyRate * POIDS_OBJECTIFS.flaggyRate
    );
  }

  /**
   * Crée une copie de cet engrenage
   * @returns {Engrenage} Une nouvelle instance avec les mêmes propriétés
   */
  cloner() {
    return new Engrenage(
      this.nom,
      this.buildRate,
      this.expBonus,
      this.flaggyRate,
      this.niveau
    );
  }
}

// Compteur pour générer des identifiants uniques
Engrenage.prochainId = 0;

/**
 * Classe représentant une case de la grille
 */
class CaseGrille {
  /**
   * Crée une nouvelle case
   * @param {number} x - Position horizontale (colonne)
   * @param {number} y - Position verticale (ligne)
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.engrenage = null; // L'engrenage placé sur cette case (null = vide)
    this.verrouillee = false; // Si true, cette case ne peut pas être modifiée
  }

  /**
   * Vérifie si cette case est vide
   * @returns {boolean} True si aucun engrenage n'est placé
   */
  estVide() {
    return this.engrenage === null;
  }

  /**
   * Place un engrenage sur cette case
   * @param {Engrenage} engrenage - L'engrenage à placer
   */
  placerEngrenage(engrenage) {
    if (!this.verrouillee) {
      this.engrenage = engrenage;
    }
  }

  /**
   * Retire l'engrenage de cette case
   */
  retirerEngrenage() {
    if (!this.verrouillee) {
      this.engrenage = null;
    }
  }
}

/**
 * Classe représentant la grille complète de construction
 */
class Grille {
  /**
   * Crée une nouvelle grille vide
   */
  constructor() {
    // Crée un tableau 2D (tableau de tableaux) pour stocker toutes les cases
    this.cases = [];

    // Remplit la grille avec des cases vides
    for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
      this.cases[y] = [];
      for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
        this.cases[y][x] = new CaseGrille(x, y);
      }
    }
  }

  /**
   * Obtient une case à une position donnée
   * @param {number} x - Colonne (0 à 11)
   * @param {number} y - Ligne (0 à 7)
   * @returns {CaseGrille|null} La case demandée, ou null si hors limites
   */
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

  /**
   * Place un engrenage à une position donnée
   * @param {number} x - Colonne
   * @param {number} y - Ligne
   * @param {Engrenage} engrenage - L'engrenage à placer
   * @returns {boolean} True si le placement a réussi
   */
  placerEngrenage(x, y, engrenage) {
    const caseGrille = this.obtenirCase(x, y);
    if (caseGrille && caseGrille.estVide()) {
      caseGrille.placerEngrenage(engrenage);
      return true;
    }
    return false;
  }

  /**
   * Retire un engrenage d'une position donnée
   * @param {number} x - Colonne
   * @param {number} y - Ligne
   */
  retirerEngrenage(x, y) {
    const caseGrille = this.obtenirCase(x, y);
    if (caseGrille) {
      caseGrille.retirerEngrenage();
    }
  }

  /**
   * Calcule le score total de cette grille
   * @returns {Object} Objet contenant les scores détaillés
   */
  calculerScore() {
    let buildRateTotal = 0;
    let expBonusTotal = 0;
    let flaggyRateTotal = 0;

    // Parcourt toutes les cases de la grille
    for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
      for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
        const caseGrille = this.cases[y][x];

        // Si cette case contient un engrenage, ajoute ses bonus
        if (caseGrille.engrenage) {
          buildRateTotal += caseGrille.engrenage.buildRate;
          expBonusTotal += caseGrille.engrenage.expBonus;
          flaggyRateTotal += caseGrille.engrenage.flaggyRate;
        }
      }
    }

    // Calcule le score pondéré (selon les priorités du joueur)
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

  /**
   * Compte le nombre de cases occupées
   * @returns {number} Nombre d'engrenages placés
   */
  compterEngrenagesPlaces() {
    let compte = 0;
    for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
      for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
        if (!this.cases[y][x].estVide()) {
          compte++;
        }
      }
    }
    return compte;
  }

  /**
   * Crée une copie complète de cette grille
   * @returns {Grille} Une nouvelle grille identique
   */
  cloner() {
    const nouvelleGrille = new Grille();

    // Copie tous les engrenages aux mêmes positions
    for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
      for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
        const caseOriginale = this.cases[y][x];
        const nouvelleCase = nouvelleGrille.cases[y][x];

        if (caseOriginale.engrenage) {
          nouvelleCase.placerEngrenage(caseOriginale.engrenage.cloner());
        }
        nouvelleCase.verrouillee = caseOriginale.verrouillee;
      }
    }

    return nouvelleGrille;
  }

  /**
   * Vide complètement la grille
   */
  vider() {
    for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
      for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
        this.retirerEngrenage(x, y);
      }
    }
  }
}

/**
 * Classe représentant une solution complète (une grille avec son score)
 */
class Solution {
  /**
   * Crée une nouvelle solution
   * @param {Grille} grille - La grille de cette solution
   */
  constructor(grille) {
    this.grille = grille;
    this.scores = grille.calculerScore();
    this.fitness = this.scores.scoreTotal; // "Fitness" = qualité de la solution
  }

  /**
   * Met à jour le score de cette solution
   */
  mettreAJourScore() {
    this.scores = this.grille.calculerScore();
    this.fitness = this.scores.scoreTotal;
  }

  /**
   * Compare cette solution avec une autre
   * @param {Solution} autreSolution - La solution à comparer
   * @returns {number} Positif si cette solution est meilleure, négatif sinon
   */
  comparerAvec(autreSolution) {
    return this.fitness - autreSolution.fitness;
  }
}

// ========================================
// 3. FONCTIONS UTILITAIRES
// ========================================

/**
 * Génère un nombre aléatoire entre min et max (inclus)
 * @param {number} min - Valeur minimale
 * @param {number} max - Valeur maximale
 * @returns {number} Nombre aléatoire
 */
function nombreAleatoire(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Mélange un tableau de manière aléatoire (algorithme de Fisher-Yates)
 * @param {Array} tableau - Le tableau à mélanger
 * @returns {Array} Le tableau mélangé
 */
function melangerTableau(tableau) {
  const copie = [...tableau]; // Crée une copie pour ne pas modifier l'original

  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Échange les éléments i et j
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }

  return copie;
}

/**
 * Tire un élément au hasard dans un tableau
 * @param {Array} tableau - Le tableau
 * @returns {*} Un élément aléatoire du tableau
 */
function elementAleatoire(tableau) {
  return tableau[nombreAleatoire(0, tableau.length - 1)];
}

// ========================================
// 4. ALGORITHME GÉNÉTIQUE
// ========================================

/**
 * Crée une solution aléatoire initiale
 * @param {Array<Engrenage>} engrenagesDisponibles - Liste des engrenages qu'on peut utiliser
 * @returns {Solution} Une nouvelle solution aléatoire
 */
function creerSolutionAleatoire(engrenagesDisponibles) {
  const grille = new Grille();

  // Mélange les engrenages pour les placer aléatoirement
  const engrenagesMelanges = melangerTableau(engrenagesDisponibles);

  let indexEngrenage = 0;

  // Remplit la grille case par case
  for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
    for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
      // Si on a encore des engrenages à placer
      if (indexEngrenage < engrenagesMelanges.length) {
        grille.placerEngrenage(x, y, engrenagesMelanges[indexEngrenage]);
        indexEngrenage++;
      }
    }
  }

  return new Solution(grille);
}

/**
 * Crée la population initiale (première génération de solutions)
 * @param {Array<Engrenage>} engrenagesDisponibles - Liste des engrenages disponibles
 * @returns {Array<Solution>} Tableau de solutions aléatoires
 */
function creerPopulationInitiale(engrenagesDisponibles) {
  console.log("🧬 Création de la population initiale...");

  const population = [];

  // Crée autant de solutions que défini dans la configuration
  for (let i = 0; i < CONFIG_ALGO_GENETIQUE.taillePopulation; i++) {
    population.push(creerSolutionAleatoire(engrenagesDisponibles));
  }

  console.log(`✅ ${population.length} solutions créées`);
  return population;
}

/**
 * Trie la population par fitness (les meilleures solutions en premier)
 * @param {Array<Solution>} population - Tableau de solutions
 * @returns {Array<Solution>} Population triée
 */
function trierPopulation(population) {
  return population.sort((a, b) => b.fitness - a.fitness);
}

/**
 * SÉLECTION : Choisit les meilleures solutions pour créer la prochaine génération
 * Utilise la méthode du "tournoi" : on fait des petits groupes et on garde le meilleur de chaque groupe
 * @param {Array<Solution>} population - Population actuelle
 * @param {number} nombreASelectionner - Combien de solutions on veut garder
 * @returns {Array<Solution>} Les solutions sélectionnées
 */
function selectionParTournoi(population, nombreASelectionner) {
  const selectionnes = [];
  const tailleTournoi = 3; // On compare 3 solutions à chaque fois

  for (let i = 0; i < nombreASelectionner; i++) {
    // Tire au hasard 3 solutions
    const participants = [];
    for (let j = 0; j < tailleTournoi; j++) {
      participants.push(elementAleatoire(population));
    }

    // Garde la meilleure des 3
    participants.sort((a, b) => b.fitness - a.fitness);
    selectionnes.push(participants[0]);
  }

  return selectionnes;
}

/**
 * CROISEMENT : Combine deux solutions "parents" pour créer un "enfant"
 * C'est comme mélanger les gènes de deux parents pour faire un bébé
 * @param {Solution} parent1 - Première solution parente
 * @param {Solution} parent2 - Deuxième solution parente
 * @returns {Solution} Une nouvelle solution enfant
 */
function croiserSolutions(parent1, parent2) {
  const grilleEnfant = new Grille();

  // Point de croisement : on coupe la grille en deux horizontalement
  const pointCroisement = nombreAleatoire(1, CONFIG_GRILLE.hauteur - 1);

  // Première partie : copie du parent 1
  for (let y = 0; y < pointCroisement; y++) {
    for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
      const caseParent1 = parent1.grille.obtenirCase(x, y);
      if (caseParent1 && caseParent1.engrenage) {
        grilleEnfant.placerEngrenage(x, y, caseParent1.engrenage.cloner());
      }
    }
  }

  // Deuxième partie : copie du parent 2
  for (let y = pointCroisement; y < CONFIG_GRILLE.hauteur; y++) {
    for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
      const caseParent2 = parent2.grille.obtenirCase(x, y);
      if (caseParent2 && caseParent2.engrenage) {
        grilleEnfant.placerEngrenage(x, y, caseParent2.engrenage.cloner());
      }
    }
  }

  return new Solution(grilleEnfant);
}

/**
 * MUTATION : Modifie légèrement une solution au hasard
 * C'est comme une "erreur" de copie qui peut créer quelque chose de meilleur
 * @param {Solution} solution - La solution à muter
 * @param {number} tauxMutation - Probabilité de mutation (0.0 à 1.0)
 */
function muterSolution(solution, tauxMutation) {
  // Pour chaque case de la grille
  for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
    for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
      // On tire au sort : est-ce qu'on mute cette case ?
      if (Math.random() < tauxMutation) {
        // Trouve une autre case au hasard
        const x2 = nombreAleatoire(0, CONFIG_GRILLE.largeur - 1);
        const y2 = nombreAleatoire(0, CONFIG_GRILLE.hauteur - 1);

        // Échange les engrenages entre ces deux cases
        const case1 = solution.grille.obtenirCase(x, y);
        const case2 = solution.grille.obtenirCase(x2, y2);

        if (case1 && case2) {
          const temp = case1.engrenage;
          case1.engrenage = case2.engrenage;
          case2.engrenage = temp;
        }
      }
    }
  }

  // Recalcule le score après les modifications
  solution.mettreAJourScore();
}

/**
 * ÉLITISME : Garde automatiquement les meilleures solutions sans les modifier
 * Ça garantit qu'on ne perd jamais les bonnes solutions
 * @param {Array<Solution>} population - Population actuelle
 * @param {number} nombreElite - Combien de solutions élites à garder
 * @returns {Array<Solution>} Les solutions élites
 */
function conserverElite(population, nombreElite) {
  const populationTriee = trierPopulation([...population]);
  return populationTriee.slice(0, nombreElite).map((s) => {
    return new Solution(s.grille.cloner());
  });
}

/**
 * ÉVOLUTION : Fait évoluer la population sur une génération
 * C'est le cœur de l'algorithme génétique
 * @param {Array<Solution>} population - Population actuelle
 * @returns {Array<Solution>} Nouvelle population évoluée
 */
function evoluerGeneration(population) {
  const nouvellePopulation = [];

  // 1. ÉLITISME : Garde les meilleures solutions
  const elite = conserverElite(population, CONFIG_ALGO_GENETIQUE.tailleElite);
  nouvellePopulation.push(...elite);

  // 2. Complète le reste de la population
  while (nouvellePopulation.length < CONFIG_ALGO_GENETIQUE.taillePopulation) {
    // SÉLECTION : Choisis deux parents
    const parents = selectionParTournoi(population, 2);
    const parent1 = parents[0];
    const parent2 = parents[1];

    // CROISEMENT : Crée un enfant (avec une certaine probabilité)
    let enfant;
    if (Math.random() < CONFIG_ALGO_GENETIQUE.tauxCroisement) {
      enfant = croiserSolutions(parent1, parent2);
    } else {
      // Sinon, copie simplement un parent
      enfant = new Solution(parent1.grille.cloner());
    }

    // MUTATION : Mute l'enfant (avec une certaine probabilité)
    muterSolution(enfant, CONFIG_ALGO_GENETIQUE.tauxMutation);

    // Ajoute l'enfant à la nouvelle population
    nouvellePopulation.push(enfant);
  }

  return nouvellePopulation;
}

// ========================================
// 5. FONCTION PRINCIPALE D'OPTIMISATION
// ========================================

/**
 * FONCTION PRINCIPALE : Lance l'optimisation complète
 * @param {Array<Engrenage>} engrenagesDisponibles - Liste des engrenages que le joueur possède
 * @param {Function} callbackProgression - Fonction appelée pour afficher la progression (optionnel)
 * @returns {Array<Solution>} Les 10 meilleures solutions trouvées
 */
function optimiserPlacementCogs(
  engrenagesDisponibles,
  callbackProgression = null
) {
  console.log("🚀 Démarrage de l'optimisation Jarvis...");
  console.log(
    `📊 Paramètres : ${CONFIG_ALGO_GENETIQUE.taillePopulation} solutions × ${CONFIG_ALGO_GENETIQUE.nombreGenerations} générations`
  );

  // ÉTAPE 1 : Créer la population initiale
  let population = creerPopulationInitiale(engrenagesDisponibles);

  // Variable pour suivre la meilleure solution trouvée
  let meilleureSolution = trierPopulation(population)[0];
  console.log(`🎯 Score initial : ${meilleureSolution.fitness.toFixed(2)}`);

  // ÉTAPE 2 : Évolution sur plusieurs générations
  for (
    let generation = 1;
    generation <= CONFIG_ALGO_GENETIQUE.nombreGenerations;
    generation++
  ) {
    // Fait évoluer la population
    population = evoluerGeneration(population);

    // Trouve la meilleure solution de cette génération
    const meilleureDeCetteGeneration = trierPopulation(population)[0];

    // Si c'est mieux que ce qu'on avait, on la garde
    if (meilleureDeCetteGeneration.fitness > meilleureSolution.fitness) {
      meilleureSolution = meilleureDeCetteGeneration;
      console.log(
        `✨ Génération ${generation} : Nouveau record ! Score = ${meilleureSolution.fitness.toFixed(
          2
        )}`
      );
    }

    // Affiche la progression tous les 20%
    if (
      generation % Math.floor(CONFIG_ALGO_GENETIQUE.nombreGenerations / 5) ===
      0
    ) {
      const pourcentage = Math.floor(
        (generation / CONFIG_ALGO_GENETIQUE.nombreGenerations) * 100
      );
      console.log(
        `⏳ Progression : ${pourcentage}% (Génération ${generation}/${CONFIG_ALGO_GENETIQUE.nombreGenerations})`
      );

      // Si une fonction de callback est fournie, on l'appelle
      if (callbackProgression) {
        callbackProgression(pourcentage, meilleureSolution);
      }
    }
  }

  // ÉTAPE 3 : Retourne les 10 meilleures solutions finales
  const solutionsFinales = trierPopulation(population).slice(0, 10);

  console.log("✅ Optimisation terminée !");
  console.log(
    `🏆 Meilleur score trouvé : ${meilleureSolution.fitness.toFixed(2)}`
  );
  console.log(
    `📈 Détails : BuildRate=${meilleureSolution.scores.buildRate.toFixed(
      2
    )}, ExpBonus=${meilleureSolution.scores.expBonus.toFixed(
      2
    )}, FlaggyRate=${meilleureSolution.scores.flaggyRate.toFixed(2)}`
  );

  return solutionsFinales;
}

// ========================================
// 6. EXPORT DES FONCTIONS (pour utilisation dans d'autres fichiers)
// ========================================

// Ces fonctions seront accessibles depuis les autres fichiers JavaScript
if (typeof module !== "undefined" && module.exports) {
  // Pour Node.js
  module.exports = {
    Engrenage,
    Grille,
    Solution,
    optimiserPlacementCogs,
    CONFIG_GRILLE,
    CONFIG_ALGO_GENETIQUE,
    POIDS_OBJECTIFS,
  };
}
