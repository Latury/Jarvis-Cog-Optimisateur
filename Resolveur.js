/**
 * ========================================
 * RÉSOLVEUR - ADAPTATEUR POUR OPTIMISEUR v2.0
 * ========================================
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

  definirPoids(buildRate, expBonus, flaggy) {
    POIDS_OBJECTIFS.buildRate = buildRate;
    POIDS_OBJECTIFS.expBonus = expBonus;
    POIDS_OBJECTIFS.flaggyRate = flaggy;
    this.poids.buildRate = buildRate;
    this.poids.expBonus = expBonus;
    this.poids.flaggyRate = flaggy;
    console.log("⚖️ Poids définis :", this.poids);
  }

  async resoudre(cogInventory, tempsResolution = 2500) {
    console.log("🚀 Début de l'optimisation");
    console.log(`⏱️ Temps alloué : ${tempsResolution}ms`);

    try {
      const engrenagesDisponibles = this.convertirInventaire(cogInventory);
      console.log(`📦 ${engrenagesDisponibles.length} engrenages à optimiser`);

      const generationsOriginales = CONFIG_ALGO_GENETIQUE.nombreGenerations;
      CONFIG_ALGO_GENETIQUE.nombreGenerations = Math.floor(
        tempsResolution / 10
      );

      const solutions = optimiserPlacementCogs(
        engrenagesDisponibles,
        (pourcentage, meilleureSolution) => {
          if (pourcentage % 20 === 0) {
            console.log(
              `📊 ${pourcentage}% - Score: ${meilleureSolution.fitness.toFixed(
                2
              )}`
            );
          }
        }
      );

      CONFIG_ALGO_GENETIQUE.nombreGenerations = generationsOriginales;

      if (!solutions || solutions.length === 0) {
        throw new Error("Aucune solution trouvée");
      }

      const meilleureSolution = solutions[0];
      console.log("✅ Optimisation terminée !");
      console.log(
        `🏆 Meilleur score : ${meilleureSolution.fitness.toFixed(2)}`
      );

      // Génère les étapes de déplacement AVANT de modifier l'inventaire
      const etapes = this.genererEtapes(
        cogInventory,
        meilleureSolution,
        engrenagesDisponibles
      );
      console.log(`📋 ${etapes.length} déplacements à effectuer`);

      const resultat = this.convertirSolution(
        meilleureSolution,
        cogInventory,
        engrenagesDisponibles
      );
      resultat.etapes = etapes; // Ajoute les étapes au résultat

      return resultat;
    } catch (erreur) {
      console.error("❌ Erreur pendant l'optimisation :", erreur);
      throw erreur;
    }
  }

  convertirInventaire(cogInventory) {
    const engrenages = [];
    console.log("🔍 Conversion de l'inventaire...");

    for (let cle in cogInventory.engrenages) {
      const numCle = parseInt(cle);
      if (numCle >= 96) continue;

      const engrenage = cogInventory.engrenages[cle];

      if (
        !engrenage ||
        engrenage.icone === "Blank" ||
        (engrenage.icone && engrenage.icone.type === "blank")
      ) {
        continue;
      }

      engrenages.push({
        nom:
          engrenage.icone && engrenage.icone.path
            ? engrenage.icone.path
            : "Engrenage",
        buildRate: engrenage.vitesseConstruction || 0,
        expBonus: engrenage.bonusExp || 0,
        flaggyRate: engrenage.flaggy || 0,
        icone: engrenage.icone,
        cleOriginale: numCle,
        engrenageOriginal: engrenage,
      });
    }

    console.log(`✅ ${engrenages.length} engrenages convertis`);
    return engrenages;
  }

  /**
   * Génère la liste des étapes de déplacement
   */
  genererEtapes(cogInventoryOriginal, solutionOptimale, engrenagesDisponibles) {
    const etapes = [];

    for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
      for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
        const cle = y * CONFIG_GRILLE.largeur + x;
        const caseGrille = solutionOptimale.grille.obtenirCase(x, y);

        if (caseGrille && caseGrille.engrenage) {
          const engOpt = caseGrille.engrenage;

          const engOriginal = engrenagesDisponibles.find(
            (e) =>
              e.nom === engOpt.nom &&
              Math.abs(e.buildRate - engOpt.buildRate) < 0.01 &&
              Math.abs(e.expBonus - engOpt.expBonus) < 0.01 &&
              Math.abs(e.flaggyRate - engOpt.flaggyRate) < 0.01
          );

          if (engOriginal && engOriginal.cleOriginale !== cle) {
            etapes.push({
              de: engOriginal.cleOriginale,
              vers: cle,
              engrenage: engOriginal,
              deX: engOriginal.cleOriginale % CONFIG_GRILLE.largeur,
              deY: Math.floor(engOriginal.cleOriginale / CONFIG_GRILLE.largeur),
              versX: x,
              versY: y,
            });
          }
        }
      }
    }

    return etapes;
  }

  convertirSolution(solution, cogInventoryOriginal, engrenagesDisponibles) {
    console.log("🔄 Conversion de la solution optimisée...");
    const resultat = cogInventoryOriginal;
    const mapPosition = new Map();

    for (let y = 0; y < CONFIG_GRILLE.hauteur; y++) {
      for (let x = 0; x < CONFIG_GRILLE.largeur; x++) {
        const caseGrille = solution.grille.obtenirCase(x, y);
        const cle = y * CONFIG_GRILLE.largeur + x;

        if (caseGrille && caseGrille.engrenage) {
          mapPosition.set(cle, caseGrille.engrenage);
        }
      }
    }

    for (let [cle, engOpt] of mapPosition.entries()) {
      const engOriginal = engrenagesDisponibles.find(
        (e) =>
          e.nom === engOpt.nom &&
          Math.abs(e.buildRate - engOpt.buildRate) < 0.01 &&
          Math.abs(e.expBonus - engOpt.expBonus) < 0.01 &&
          Math.abs(e.flaggyRate - engOpt.flaggyRate) < 0.01
      );

      if (engOriginal && engOriginal.cleOriginale !== undefined) {
        if (engOriginal.cleOriginale !== cle) {
          resultat.move(engOriginal.cleOriginale, cle);
        }
      }
    }

    console.log("✅ Solution convertie avec succès");
    return resultat;
  }

  setWeights(buildRate, expBonus, flaggy) {
    return this.definirPoids(buildRate, expBonus, flaggy);
  }

  async solve(cogInventory, tempsResolution) {
    return this.resoudre(cogInventory, tempsResolution);
  }
}

const Solver = Resolveur;

if (typeof window !== "undefined") {
  window.Resolveur = Resolveur;
  window.Solver = Solver;
}
