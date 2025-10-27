/**
 * ========================================
 * JARVIS COG OPTIMISATEUR - AFFICHEUR PLATEAU
 * ========================================
 *
 * Gestion de l'affichage du plateau d'engrenages
 */

class AfficheurPlateau {
  _lignes;
  _colonnes;
  _lignesVisibles;
  _type;

  _indexPage = 0;
  _nombrePages = 0;

  plateau;

  deplacementDepuis = undefined;
  deplacementVers = undefined;

  constructor(lignes, colonnes, type, lignesVisibles = lignes) {
    this._lignes = lignes;
    this._colonnes = colonnes;
    this._lignesVisibles = lignesVisibles;
    this._type = type;

    this._nombrePages = lignes / lignesVisibles;

    this.plateau = new Array(colonnes * lignes);
    for (let i = 0; i < this.plateau.length; i++) {
      this.plateau[i] = {
        item: undefined,
        elem: undefined,
        row: Math.floor(i / colonnes),
        column: i % colonnes,
      };
    }
  }

  creerElementHTML() {
    const elemTableau = document.createElement("table");
    elemTableau.className = "cogboard";

    for (let ligne = 0; ligne < this._lignesVisibles; ligne++) {
      const elemLigne = document.createElement("tr");
      for (let col = 0; col < this._colonnes; col++) {
        const index = ligne * this._colonnes + col;

        const elemCol = document.createElement("td");
        this.plateau[index].elem = elemCol;
        for (let i = 1; i < this._nombrePages; i++) {
          this.plateau[index + i * this._lignesVisibles * this._colonnes].elem =
            elemCol;
        }
        elemLigne.appendChild(elemCol);
      }
      elemTableau.appendChild(elemLigne);
    }

    return elemTableau;
  }

  afficherPage(indexPage) {
    indexPage = Math.max(0, Math.min(indexPage, this._nombrePages - 1));
    this._indexPage = indexPage;

    const taillePage = this._lignesVisibles * this._colonnes;
    const index = indexPage * taillePage;

    for (let i = index; i < index + taillePage; i++) {
      this._rendu(this.plateau[i]);
    }
  }

  obtenirPage(coord) {
    if (coord.location === this._type) {
      return Math.floor(coord.y / this._lignesVisibles);
    }
    return -1;
  }

  _obtenirIndex(ligne, colonne) {
    if (ligne > this._lignes) {
      throw new Error("Tentative d'accès à une ligne en dehors du plateau");
    }
    if (colonne > this._colonnes) {
      throw new Error("Tentative d'accès à une colonne en dehors du plateau");
    }

    return ligne * this._colonnes + colonne;
  }

  _rendu(emplacement) {
    let engrenage = emplacement.item;
    const col = emplacement.elem;

    const estVisible =
      emplacement.row >= this._indexPage * this._lignesVisibles &&
      emplacement.row <
        this._indexPage * this._lignesVisibles + this._lignesVisibles;

    if (!estVisible) {
      return;
    }

    if (!engrenage) {
      engrenage = {
        fixe: false,
        bloque: false,
        icone: "Blank",
      };
    }

    let bordure = "black";

    if (engrenage.fixe) {
      // bordure = "yellow";
    }

    col.style.border = `1px solid ${bordure}`;
    col.style.borderBottom = `2px solid ${bordure}`;
    col.style.backgroundImage = `url("assets/${
      (!engrenage.bloque && "cog_bg.png") || "cog_blank.png"
    }")`;
    col.style.backgroundPosition = "center";
    col.style.backgroundSize = "cover";

    if (col.classList.contains("toMove")) {
      col.classList.remove("toMove");
    }

    if (!engrenage.bloque) {
      let div;
      if (col.firstChild) {
        div = col.firstChild;
      } else {
        div = document.createElement("div");
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.backgroundPosition = "center";
        div.style.backgroundRepeat = "no-repeat";
        div.style.color = "white";
        col.appendChild(div);
      }

      // DEBUG : Affiche les informations de l'engrenage
      if (engrenage.icone !== "Blank") {
        console.log("🔧 DEBUG Engrenage:", {
          icone: engrenage.icone,
          estJoueur: engrenage.estJoueur,
          type: engrenage.icone ? engrenage.icone.type : "undefined",
          path: engrenage.icone ? engrenage.icone.path : "undefined",
        });
      }

      if (
        engrenage.icone === "Blank" ||
        (engrenage.icone && engrenage.icone.type === "blank")
      ) {
        div.style.backgroundImage = "";
        div.innerHTML = "";
      } else if (
        engrenage.estJoueur &&
        engrenage.icone &&
        engrenage.icone.path
      ) {
        console.log("👤 Affichage joueur:", engrenage.icone.path);
        div.style.backgroundImage = `url("${engrenage.icone.path}")`;
        div.style.backgroundSize = "contain";
        div.innerHTML = "";
      } else if (engrenage.icone && engrenage.icone.path) {
        console.log("⚙️ Affichage engrenage:", engrenage.icone.path);
        div.style.removeProperty("background-size");
        div.style.backgroundImage = `url("${engrenage.icone.path}")`;
        div.innerHTML = "";
      } else {
        console.warn("⚠️ Icône invalide pour engrenage:", engrenage);
      }
    } else {
      if (engrenage.isFlag) {
        col.style.backgroundImage = `url("icons/cogs/flag.png")`;
      }
    }
  }

  definir(ligne, colonne, item) {
    const index = this._obtenirIndex(ligne, colonne);
    const emplacement = this.plateau[index];
    emplacement.item = item;

    this._rendu(emplacement);
  }

  deplacer(coordDepuis, coordVers) {
    if (this.deplacementVers) this._rendu(this.deplacementVers);

    if (this.deplacementDepuis) this._rendu(this.deplacementDepuis);

    if (coordDepuis.location == this._type) {
      const depuis = this.obtenir(coordDepuis.y, coordDepuis.x);
      const colDepuis = depuis.elem;

      this.deplacementDepuis = depuis;

      colDepuis.style.border = `1px solid lightgreen`;
      colDepuis.style.borderBottom = `2px solid lightgreen`;
      colDepuis.classList.add("toMove");
    } else {
      this.deplacementDepuis = undefined;
    }

    if (coordVers.location === this._type) {
      const vers = this.obtenir(coordVers.y, coordVers.x);
      const colVers = vers.elem;

      this.deplacementVers = vers;

      colVers.style.border = `1px solid lightgreen`;
      colVers.style.borderBottom = `2px solid lightgreen`;
      colVers.classList.add("toMove");
    } else {
      this.deplacementVers = undefined;
    }
  }

  obtenir(ligne, colonne) {
    const index = this._obtenirIndex(ligne, colonne);
    return this.plateau[index];
  }

  // Alias pour compatibilité avec l'ancien code
  createHTMLElement() {
    return this.creerElementHTML();
  }

  showPage(indexPage) {
    return this.afficherPage(indexPage);
  }

  getPage(coord) {
    return this.obtenirPage(coord);
  }

  set(ligne, colonne, item) {
    return this.definir(ligne, colonne, item);
  }

  move(coordDepuis, coordVers) {
    return this.deplacer(coordDepuis, coordVers);
  }

  get(ligne, colonne) {
    return this.obtenir(ligne, colonne);
  }
}

// Alias pour compatibilité avec l'ancien code
const BoardRenderer = AfficheurPlateau;
