console.log("✅ InventaireEngrenages.js chargé !");

const CARTE_QUALITE_ICONE = {
  ["0"]: "Nooby",
  ["1"]: "Decent",
  ["2"]: "Superb",
  ["3"]: "Ultimate",
  ["Y"]: "Yang",
  ["Z"]: "Yin",
};

const CARTE_TYPE_ICONE = {
  ["A00"]: "Cog",
  ["A0"]: "CogB",
  ["A1"]: "Average",
  ["A2"]: "Spur",
  ["A3"]: "Stacked",
  ["A4"]: "Deckered",
  ["B0"]: "Double",
  ["B1"]: "Trips",
  ["B2"]: "Trabble",
  ["B3"]: "Quad",
  ["B4"]: "Penta",
  ["ad"]: "Adjacent",
  ["di"]: "Diagonal",
  ["up"]: "Up",
  ["do"]: "Down",
  ["le"]: "Left",
  ["ri"]: "Right",
  ["ro"]: "Row",
  ["co"]: "Column",
  ["cr"]: "Corner",
};

const CARTE_YIN = {
  ["A00"]: "Yin_Top_Left_Cog",
  ["A01"]: "Yin_Top_Right_Cog",
  ["A02"]: "Yin_Bottom_Left_Cog",
  ["A03"]: "Yin_Bottom_Right_Cog",
};

const LIGNES_INV = 8;
const COLONNES_INV = 12;
const DEBUT_RESERVE = 108;

class Engrenage {
  constructor(valeursInitiales = {}) {
    this._cle = valeursInitiales.key;
    this.icone = valeursInitiales.icon;
    this.cleInitiale =
      valeursInitiales.initialKey !== undefined
        ? valeursInitiales.initialKey
        : valeursInitiales.key;
    this.vitesseConstruction = valeursInitiales.buildRate;
    this.estJoueur = valeursInitiales.isPlayer;
    this.estDrapeau = valeursInitiales.isFlag;
    this.gainExp = valeursInitiales.expGain;
    this.flaggy = valeursInitiales.flaggy;
    this.bonusExp = valeursInitiales.expBonus;
    this.boostRayonConstruction = valeursInitiales.buildRadiusBoost;
    this.boostRayonExp = valeursInitiales.expRadiusBoost;
    this.boostRayonFlaggy = valeursInitiales.flaggyRadiusBoost;
    this.rayonBoost = valeursInitiales.boostRadius;
    this.boostDrapeau = valeursInitiales.flagBoost;
    this.rien = valeursInitiales.nothing;
    this.fixe = valeursInitiales.fixed;
    this.bloque = valeursInitiales.blocked;
    this._position = null;
  }

  get key() {
    return this._cle;
  }

  set key(v) {
    this._position = null;
    this._cle = Number.parseInt(v);
  }

  position(numCle) {
    const estParDefaut = numCle === undefined;
    if (this._position && estParDefaut) return this._position;
    numCle = numCle ?? Number.parseInt(this.key);

    const emplacement =
      numCle >= 96 ? (numCle <= 107 ? "build" : "spare") : "board";
    let parLigne = 3;
    let decalage = DEBUT_RESERVE;

    if (emplacement === "board") {
      parLigne = COLONNES_INV;
      decalage = 0;
    } else if (emplacement === "build") {
      decalage = 96;
    }

    const y = Math.floor((numCle - decalage) / parLigne);
    const x = Math.floor((numCle - decalage) % parLigne);
    const resultat = { location: emplacement, x, y };

    if (estParDefaut) {
      this._position = resultat;
    }
    return resultat;
  }
}

class PlateauSimule {
  constructor(inventaire) {
    this.inventaire = inventaire;
    this.length = LIGNES_INV;

    this[Symbol.Iterator] = function* () {
      for (let s = 0; s < LIGNES_INV; s++) yield s;
    };

    for (let i = 0; i < LIGNES_INV; i++) {
      const colonneProxy = {
        length: COLONNES_INV,
        [Symbol.Iterator]: function* () {
          for (let s = 0; s < COLONNES_INV; s++) yield s;
        },
      };
      for (let j = 0; j < COLONNES_INV; j++) {
        const cle = i * COLONNES_INV + j;
        Object.defineProperty(colonneProxy, j, {
          get: () => this.inventaire.obtenir(cle),
        });
      }
      Object.defineProperty(this, i, {
        get: () => colonneProxy,
      });
    }
  }
}

class InventaireEngrenages {
  constructor(engrenages = {}, emplacements = {}) {
    this.engrenages = engrenages;
    this.emplacements = emplacements;
    this.positionsDrapeaux = [];
    this.ameliorationsBoutiqueFlaggy = 0;
    this.clesEmplacementsDisponibles = [];
    this._score = null;
    this._plateau = new PlateauSimule(this);
  }

  get cleEngrenages() {
    return Object.keys(this.engrenages);
  }

  obtenir(cle) {
    return this.engrenages[cle] || this.emplacements[cle];
  }

  get(cle) {
    return this.obtenir(cle);
  }

  static _recuperationSecurisee(tableau, ...indices) {
    while (indices.length) {
      if (tableau === undefined) break;
      tableau = tableau[indices.splice(0, 1)[0]];
    }
    return tableau;
  }

  charger(sauvegarde) {
    this.clesEmplacementsDisponibles = [];
    this._score = null;
    console.log("📦 Chargement des données de sauvegarde...");

    // Debug : Afficher toutes les clés disponibles
    console.log(
      "🔍 Clés disponibles dans les données:",
      Object.keys(sauvegarde).filter(
        (k) => k.includes("Cog") || k.includes("Flag")
      )
    );

    let classes = [];
    classes[1] = "Débutant";
    classes[2] = "Compagnon";
    classes[3] = "Maestro";
    classes[7] = "Guerrier";
    classes[8] = "Barbare";
    classes[9] = "Écuyer";
    classes[10] = "Berserker Sanguinaire";
    classes[12] = "Chevalier Divin";
    classes[19] = "Archer";
    classes[20] = "Archer";
    classes[21] = "Chasseur";
    classes[22] = "Briseur de Siège";
    classes[25] = "Maître des Bêtes";
    classes[31] = "Mage";
    classes[32] = "Sorcier";
    classes[33] = "Chaman";
    classes[34] = "Sorcier Élémentaire";

    const iconesChapeaux = {};
    const nomsJoueurs = sauvegarde["playerNames"];

    if (nomsJoueurs) {
      nomsJoueurs.forEach((nom, i) => {
        const emplacementClasse = `CharacterClass_${i}`;
        const indiceClasse = sauvegarde[emplacementClasse];
        const nomClasse = classes[indiceClasse];
        console.log(
          `👤 Joueur: ${nom} | Classe: ${nomClasse} (ID: ${indiceClasse})`
        );

        if (indiceClasse >= 31) {
          window.player._colorHead(0.9, 0.77, 1);
        } else if (indiceClasse >= 19) {
          window.player._colorHead(0.58, 1, 0.6);
        } else if (indiceClasse >= 7) {
          window.player._colorHead(1, 0.77, 0.75);
        } else if (indiceClasse === 9) {
          window.player._colorHead(1, 1, 0);
        } else {
          window.player._colorHead(0.5, 0.91, 0.92);
        }

        const emplacementEquipement = `EquipOrder_${i}`;
        const equipement = sauvegarde[emplacementEquipement];
        let chapeauTrouve = false;

        equipement.forEach((emplacements) => {
          const longueur = emplacements.length;
          for (let i = 0; i < longueur; i++) {
            const nomEquipement = emplacements[i];
            if (nomEquipement.indexOf("Hats") !== -1) {
              const correspondance = nomEquipement.match(
                /EquipmentHats(\d+)(?:_x1)?/
              );
              if (correspondance.length === 2) {
                const indice = parseInt(correspondance[1]);
                iconesChapeaux[nom] = {
                  type: "hat",
                  path: window.player.render(indice),
                };
                chapeauTrouve = true;
              }
              break;
            }
          }
        });

        if (!chapeauTrouve) {
          iconesChapeaux[nom] = {
            type: "head",
            path: "assets/icons/head.png",
          };
        }
      });
    }

    // Gestion sécurisée des améliorations Flaggy
    const gemItemsData = sauvegarde["GemItemsPurchased"];
    if (gemItemsData && gemItemsData !== "undefined") {
      try {
        this.ameliorationsBoutiqueFlaggy = JSON.parse(gemItemsData)[118] || 0;
        console.log(
          `💎 Améliorations Flaggy (boutique): ${this.ameliorationsBoutiqueFlaggy}`
        );
      } catch (error) {
        console.warn(
          "⚠️ Impossible de charger GemItemsPurchased:",
          error.message
        );
        this.ameliorationsBoutiqueFlaggy = 0;
      }
    } else {
      console.warn("⚠️ GemItemsPurchased non trouvé dans les données");
      this.ameliorationsBoutiqueFlaggy = 0;
    }

    // Chargement sécurisé des engrenages
    const cogMData = sauvegarde["CogM"];
    const cogOData = sauvegarde["CogO"];

    console.log("📊 CogM existe ?", cogMData ? "OUI" : "NON");
    console.log("📊 CogO existe ?", cogOData ? "OUI" : "NON");

    if (!cogMData || cogMData === "undefined") {
      throw new Error(
        "❌ Données CogM manquantes.\n\nCauses possibles:\n1. Les Cogs ne sont pas débloqués dans le jeu\n2. Données IdleonToolbox incomplètes\n3. Essayez de resynchroniser sur IdleonToolbox"
      );
    }

    if (!cogOData || cogOData === "undefined") {
      throw new Error(
        "❌ Données CogO manquantes.\n\nCauses possibles:\n1. Les Cogs ne sont pas débloqués dans le jeu\n2. Données IdleonToolbox incomplètes\n3. Essayez de resynchroniser sur IdleonToolbox"
      );
    }

    const engrenageschBrut = JSON.parse(cogMData);
    const iconesEngrenages = JSON.parse(cogOData).map((c) => {
      let icone = { type: "cog" };

      if (c === "Blank") {
        icone.type = "blank";
        icone.path = "assets/cog_blank.png";
      } else if (c.startsWith("Player")) {
        icone = iconesChapeaux[c.substring(7)] || {
          type: "head",
          path: "assets/icons/head.png",
        };
      } else if (c === "CogY") {
        icone.type = "cog";
        icone.path = "assets/icons/cogs/Yang_Cog.png";
      } else {
        icone.type = "cog";
        const analyse = c.match(/^Cog([0123YZ])(.{2,3})$/);
        if (analyse[1] === "Z") {
          icone.path = "assets/icons/cogs/" + CARTE_YIN[analyse[2]] + ".png";
        } else {
          icone.path =
            "assets/icons/cogs/" +
            CARTE_TYPE_ICONE[analyse[2]] +
            "_" +
            CARTE_QUALITE_ICONE[analyse[1]] +
            ".png";
        }
      }
      return icone;
    });

    const tableauEngrenages = Object.entries(engrenageschBrut).map(
      ([cle, e]) => {
        const numCle = Number.parseInt(cle);
        return new Engrenage({
          key: numCle,
          icon: iconesEngrenages[numCle] || "Blank",
          buildRate: e.a,
          isPlayer: e.b > 0,
          expGain: e.b,
          flaggy: e.c,
          expBonus: e.d,
          buildRadiusBoost: e.e,
          expRadiusBoost: e.f,
          flaggyRadiusBoost: e.g,
          boostRadius: e.h,
          flagBoost: e.j,
          nothing: e.k,
          fixed: e.h === "everything",
          blocked: false,
        });
      }
    );

    // Chargement sécurisé des drapeaux
    const flagPData = sauvegarde["FlagP"];
    const flagUData = sauvegarde["FlagU"];

    console.log("📊 FlagP existe ?", flagPData ? "OUI" : "NON");
    console.log("📊 FlagU existe ?", flagUData ? "OUI" : "NON");

    if (!flagPData || flagPData === "undefined") {
      console.warn("⚠️ FlagP non trouvé, initialisation par défaut");
      this.positionsDrapeaux = [];
    } else {
      this.positionsDrapeaux = JSON.parse(flagPData).filter((v) => v >= 0);
    }

    if (!flagUData || flagUData === "undefined") {
      throw new Error("❌ Données FlagU manquantes.");
    }

    const emplacements = JSON.parse(flagUData).map((n, i) => {
      if (n > 0 && this.positionsDrapeaux.includes(i)) {
        return new Engrenage({
          key: i,
          fixed: true,
          blocked: true,
          isFlag: true,
          icon: "Blank",
        });
      }
      if (n !== -11) {
        return new Engrenage({ key: i, fixed: true, blocked: true });
      }
      return new Engrenage({ key: i, icon: "Blank" });
    });

    this.emplacements = {};
    for (const emplacement of emplacements) {
      this.emplacements[emplacement.key] = emplacement;
      if (!emplacement.fixe) {
        this.clesEmplacementsDisponibles.push(emplacement.key);
      }
    }

    this.engrenages = {};
    for (const engrenage of tableauEngrenages) {
      this.engrenages[engrenage.key] = engrenage;
    }

    console.log(
      `✅ ${
        Object.keys(this.engrenages).length
      } engrenages chargés avec succès !`
    );
  }

  load(sauvegarde) {
    return this.charger(sauvegarde);
  }

  cloner() {
    const e = {};
    for (let [c, v] of Object.entries(this.engrenages)) {
      e[c] = new Engrenage(v);
    }
    const emp = {};
    for (let [c, v] of Object.entries(this.emplacements)) {
      emp[c] = new Engrenage(v);
    }
    const resultat = new InventaireEngrenages(e, emp);
    resultat.positionsDrapeaux = [...this.positionsDrapeaux];
    resultat.ameliorationsBoutiqueFlaggy = this.ameliorationsBoutiqueFlaggy;
    resultat.clesEmplacementsDisponibles = [
      ...this.clesEmplacementsDisponibles,
    ];
    return resultat;
  }

  clone() {
    return this.cloner();
  }

  get plateau() {
    return this._plateau;
  }

  get board() {
    return this.plateau;
  }

  get score() {
    if (this._score !== null) return this._score;

    const resultat = {
      buildRate: 0,
      expBonus: 0,
      flaggy: 0,
      expBoost: 0,
      flagBoost: 0,
    };

    const plateau = this.plateau;
    const grilleBonus = Array(LIGNES_INV)
      .fill(0)
      .map(() => {
        return Array(COLONNES_INV)
          .fill(0)
          .map(() => {
            return { ...resultat };
          });
      });

    for (let cle of this.clesEmplacementsDisponibles) {
      const entree = this.obtenir(cle);
      if (!entree.rayonBoost) continue;

      const ameliores = [];
      const { x: j, y: i } = entree.position();

      switch (entree.rayonBoost) {
        case "diagonal":
          ameliores.push(
            [i - 1, j - 1],
            [i - 1, j + 1],
            [i + 1, j - 1],
            [i + 1, j + 1]
          );
          break;
        case "adjacent":
          ameliores.push([i - 1, j], [i, j + 1], [i + 1, j], [i, j - 1]);
          break;
        case "up":
          ameliores.push(
            [i - 2, j - 1],
            [i - 2, j],
            [i - 2, j + 1],
            [i - 1, j - 1],
            [i - 1, j],
            [i - 1, j + 1]
          );
          break;
        case "right":
          ameliores.push(
            [i - 1, j + 2],
            [i, j + 2],
            [i + 1, j + 2],
            [i - 1, j + 1],
            [i, j + 1],
            [i + 1, j + 1]
          );
          break;
        case "down":
          ameliores.push(
            [i + 2, j - 1],
            [i + 2, j],
            [i + 2, j + 1],
            [i + 1, j - 1],
            [i + 1, j],
            [i + 1, j + 1]
          );
          break;
        case "left":
          ameliores.push(
            [i - 1, j - 2],
            [i, j - 2],
            [i + 1, j - 2],
            [i - 1, j - 1],
            [i, j - 1],
            [i + 1, j - 1]
          );
          break;
        case "row":
          for (let k = 0; k < COLONNES_INV; k++) {
            if (j == k) continue;
            ameliores.push([i, k]);
          }
          break;
        case "column":
          for (let k = 0; k < LIGNES_INV; k++) {
            if (i == k) continue;
            ameliores.push([k, j]);
          }
          break;
        case "corner":
          ameliores.push(
            [i - 2, j - 2],
            [i - 2, j + 2],
            [i + 2, j - 2],
            [i + 2, j + 2]
          );
          break;
        case "around":
          ameliores.push(
            [i - 2, j],
            [i - 1, j - 1],
            [i - 1, j],
            [i - 1, j + 1],
            [i, j - 2],
            [i, j - 1],
            [i, j + 1],
            [i, j + 2],
            [i + 1, j - 1],
            [i + 1, j],
            [i + 1, j + 1],
            [i + 2, j]
          );
          break;
        case "everything":
          for (let k = 0; k < LIGNES_INV; k++) {
            for (let l = 0; l < COLONNES_INV; l++) {
              if (i === k && j === l) continue;
              ameliores.push([k, l]);
            }
          }
          break;
        default:
          break;
      }

      for (const coordBoost of ameliores) {
        const bonus = InventaireEngrenages._recuperationSecurisee(
          grilleBonus,
          ...coordBoost
        );
        if (!bonus) continue;
        bonus.buildRate += entree.boostRayonConstruction || 0;
        bonus.flaggy += entree.boostRayonFlaggy || 0;
        bonus.expBoost += entree.boostRayonExp || 0;
        bonus.flagBoost += entree.boostDrapeau || 0;
      }
    }

    for (let cle of this.clesEmplacementsDisponibles) {
      const entree = this.obtenir(cle);
      resultat.buildRate += entree.vitesseConstruction || 0;
      resultat.expBonus += entree.bonusExp || 0;
      resultat.flaggy += entree.flaggy || 0;

      const pos = entree.position();
      const bonus = grilleBonus[pos.y][pos.x];
      const b = (bonus.buildRate || 0) / 100;
      resultat.buildRate += Math.ceil((entree.vitesseConstruction || 0) * b);

      if (entree.estJoueur) {
        resultat.expBoost += bonus.expBoost || 0;
      }

      const f = (bonus.flaggy || 0) / 100;
      resultat.flaggy += Math.ceil((entree.flaggy || 0) * f);
    }

    for (let cle of this.positionsDrapeaux) {
      const entree = this.obtenir(cle);
      const pos = entree.position();
      const bonus = grilleBonus[pos.y][pos.x];
      resultat.flagBoost += bonus.flagBoost || 0;
    }

    resultat.flaggy = Math.floor(
      resultat.flaggy * (1 + this.ameliorationsBoutiqueFlaggy * 0.5)
    );
    return (this._score = resultat);
  }

  deplacer(pos1, pos2) {
    this._score = null;

    if (Array.isArray(pos1)) {
      pos1 = pos1[0] * COLONNES_INV + pos1[1];
      pos2 = pos2[0] * COLONNES_INV + pos2[1];
    }
    if (pos1 instanceof Object) {
      pos1 = pos1.y * COLONNES_INV + pos1.x;
      pos2 = pos2.y * COLONNES_INV + pos2.x;
    }

    const temp = this.engrenages[pos2];
    this.engrenages[pos2] = this.engrenages[pos1];

    if (!this.engrenages[pos2]) {
      delete this.engrenages[pos2];
    } else {
      this.engrenages[pos2].key = pos2;
    }

    this.engrenages[pos1] = temp;

    if (!this.engrenages[pos1]) {
      delete this.engrenages[pos1];
    } else {
      this.engrenages[pos1].key = pos1;
    }
  }

  move(pos1, pos2) {
    return this.deplacer(pos1, pos2);
  }
}

const CogInventory = InventaireEngrenages;
const Cog = Engrenage;
const FakeBoard = PlateauSimule;
