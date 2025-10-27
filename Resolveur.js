/**
 * ========================================
 * RÉSOLVEUR - ADAPTATEUR POUR OPTIMISEUR v2.0
 * ========================================
 *
 * Ce fichier fait le pont entre l'ancien système et le nouveau Optimiseur.js
 * Il permet à l'interface existante de fonctionner avec le nouvel algorithme génétique
 *
 * AUTEUR : Latury
 * DATE : 26 octobre 2025
 * DERNIÈRE MISE À JOUR : 26 octobre 2025 - 22h45
 */

class Resolveur {
  constructor() {
    this.poids = {
      buildRate: 1.0,
      expBonus: 1.0,
      flaggyRate: 1.0,
    };

    console.log("🔧 Résolveur adaptateur initialisé (Optimiseur.js)");
  }

  /**
   * Définit les poids pour l'optimisation
   * @param {number} buildRate - Poids de la vitesse de construction
   * @param {number} expBonus - Poids du bonus d'expérience
   * @param {number} flaggy - Poids du taux de drapeaux
   */
  definirPoids(buildRate, expBonus, flaggy) {
    // Met à jour les poids globaux du nouveau système
    POIDS_OBJECTIFS.buildRate = buildRate;
    POIDS_OBJECTIFS.expBonus = expBonus;
    POIDS_OBJECTIFS.flaggyRate = flaggy;

    this.poids.buildRate = buildRate;
    this.poids.expBonus = expBonus;
    this.poids.flaggyRate = flaggy;

    console.log("⚖️ Poids définis :", this.poids);
  }

  /**
   * Lance l'optimisation
   * @param {CogInventory} cogInventory - L'inventaire des engrenages
   * @param {number} tempsResolution - Temps d'optimisation en millisecondes
   * @returns {Promise<CogInventory>} La meilleure solution trouvée
   */
  async resoudre(cogInventory, tempsResolution = 2500) {
    console.log("🚀 Début de l'optimisation");
    console.log(`⏱️ Temps alloué : ${tempsResolution}ms`);

    try {
      // Convertit l'inventaire en liste d'engrenages pour le nouveau système
      const engrenagesDisponibles = this.convertirInventaire(cogInventory);

      console.log(`📦 ${engrenagesDisponibles.length} engrenages à optimiser`);

      // Ajuste le nombre de générations en fonction du temps disponible
      const generationsOriginales = CONFIG_ALGO_GENETIQUE.nombreGenerations;
      CONFIG_ALGO_GENETIQUE.nombreGenerations = Math.floor(tempsResolution / 10);

      // Appelle le nouveau système d'optimisation (Optimiseur.js)
      const solutions = optimiserPlacementCogs(
        engrenagesDisponibles,
        (pourcentage, meilleureSolution) => {
          // Callback de progression (optionnel)
          if (pourcentage % 20 === 0) {
            console.log(
              `📊 ${pourcentage}% - Score: ${meilleureSolution.fitness.toFixed(
                2
              )}`
            );
          }
        }
      );

      // Restaure le nombre de générations original
      CONFIG_ALGO_GENETIQUE.nombreGenerations = generationsOriginales;

      if (!solutions || solutions.length === 0) {
        throw new Error("Aucune solution trouvée");
      }

      // Prend la meilleure solution
      const meilleureSolution = solutions[0];

      console.log("✅ Optimisation terminée !");
      console.log(
        `🏆 Meilleur score : ${meilleureSolution.fitness.toFixed(2)}`
      );

      // Convertit la solution en format compatible avec l'ancien système
      return this.convertirSolution(meilleureSolution, cogInventory);
    } catch (erreur) {
      console.error("❌ Erreur pendant l'optimisation :", erreur);
      throw erreur;
    }
  }

  /**
   * Convertit l'inventaire du format ancien vers le nouveau
   * @param {CogInventory} cogInventory - Inventaire à convertir
   * @returns {Array<Engrenage>} Liste d'engrenages pour le nouveau système
   */
  convertirInventaire(cogInventory) {
    const engrenages = [];

    // Parcourt tous les engrenages de l'inventaire
    for (let cle in cogInventory.cogs) {
      const engrenage = cogInventory.cogs[cle];

      if (!engrenage || engrenage.icon === "Blank") {
        continue;
      }

      // Crée un nouvel engrenage avec le nouveau système
      const nouvelEngrenage = new Engrenage(
        engrenage.icon,
        engrenage.buildRate || 0,
        engrenage.expBonus || 0,
        engrenage.flaggy || 0,
        1 // Niveau par défaut
      );

      engrenages.push(nouvelEngrenage);
    }

    return engrenages;
  }

  /**
   * Convertit une solution du nouveau format vers l'ancien
   * @param {Solution} solution - Solution du nouveau système
   * @param {CogInventory} cogInventoryOriginal - Inventaire original
   * @returns {CogInventory} Inventaire avec la solution appliquée
   */
  convertirSolution(solution, cogInventoryOriginal) {
    // Clone l'inventaire original
    const resultat = cogInventoryOriginal.clone();

    // Vide la grille actuelle
    for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
      for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
        const cle = y * CONFIG_GRILLE.largeur + x;
        if (resultat.cogs[cle]) {
          resultat.cogs[cle].icon = "Blank";
          resultat.cogs[cle].buildRate = 0;
          resultat.cogs[cle].expBonus = 0;
          resultat.cogs[cle].flaggy = 0;
        }
      }
    }

    // Place les engrenages de la solution optimale
    for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
      for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
        const caseGrille = solution.grille.obtenirCase(x, y);

        if (caseGrille && caseGrille.engrenage) {
          const cle = y * CONFIG_GRILLE.largeur + x;

          if (resultat.cogs[cle]) {
            resultat.cogs[cle].icon = caseGrille.engrenage.nom;
            resultat.cogs[cle].buildRate = caseGrille.engrenage.buildRate;
            resultat.cogs[cle].expBonus = caseGrille.engrenage.expBonus;
            resultat.cogs[cle].flaggy = caseGrille.engrenage.flaggyRate;
          }
        }
      }
    }

    // Le score sera automatiquement recalculé par CogInventory
    // On ne peut pas le définir directement car c'est un getter

    return resultat;
  }

  // Alias pour compatibilité avec l'ancien code
  setWeights(buildRate, expBonus, flaggy) {
    return this.definirPoids(buildRate, expBonus, flaggy);
  }

  async solve(cogInventory, tempsResolution) {
    return this.resoudre(cogInventory, tempsResolution);
  }
}

// Alias pour compatibilité avec l'ancien code
const Solver = Resolveur;

// Export pour utilisation dans le navigateur
if (typeof window !== "undefined") {
  window.Resolveur = Resolveur;
  window.Solver = Solver; // Alias de compatibilité
}
