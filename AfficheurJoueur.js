/**
 * ========================================
 * JARVIS COG OPTIMISATEUR - AFFICHEUR JOUEUR
 * ========================================
 *
 * Gestion de l'affichage des personnages joueurs
 * (chapeaux et têtes)
 */

class AfficheurJoueur {
  _imgChapeaux;
  _imgTete;
  _joueur = {
    canvas: undefined,
    context: undefined,
  };
  _tete = {
    canvas: undefined,
    context: undefined,
  };

  largeur = 36;
  hauteur = 36;

  echelle = 1.5;

  constructor() {
    // Charge l'image des chapeaux
    const chapeaux = document.createElement("img");
    chapeaux.src = "assets/hats2.png";
    chapeaux.style.visibility = "hidden";
    document.body.appendChild(chapeaux);
    this._imgChapeaux = chapeaux;

    // Charge l'image de la tête
    const tete = document.createElement("img");
    tete.src = "icons/head.png";
    tete.style.visibility = "hidden";
    document.body.appendChild(tete);
    this._imgTete = tete;

    // Crée le canvas pour la tête
    const canvasTete = document.createElement("canvas");
    tete.addEventListener("load", (ev) => {
      console.log("👤 Tête chargée");
      canvasTete.width = tete.width;
      canvasTete.height = tete.height;
    });
    canvasTete.style.visibility = "hidden";
    document.body.appendChild(canvasTete);
    this._tete.canvas = canvasTete;
    let ctx = canvasTete.getContext("2d");
    this._tete.context = ctx;

    // Crée le canvas pour le joueur
    const canvasJoueur = document.createElement("canvas");
    canvasJoueur.width = this.largeur;
    canvasJoueur.height = this.hauteur;
    canvasJoueur.style.visibility = "hidden";
    document.body.appendChild(canvasJoueur);
    this._joueur.canvas = canvasJoueur;
    ctx = canvasJoueur.getContext("2d");
    this._joueur.context = ctx;
  }

  _colorerTete(pr, pg, pb) {
    console.log("🎨 Coloration de la tête");
    const ctx = this._tete.context;
    ctx.clearRect(0, 0, this._tete.width, this._tete.height);
    let largeurTete = parseInt(this._imgTete.width);
    let hauteurTete = parseInt(this._imgTete.height);
    ctx.drawImage(this._imgTete, 0, 0, largeurTete, hauteurTete);

    let donneesImg;
    try {
      donneesImg = ctx.getImageData(0, 0, largeurTete, hauteurTete);
    } catch (e) {
      return;
    }

    // Applique la coloration selon la classe
    for (let i = 0; i < donneesImg.data.length; i += 4) {
      const r = donneesImg.data[i],
        g = donneesImg.data[i + 1],
        b = donneesImg.data[i + 2],
        a = donneesImg.data[i + 3];
      if (r + g + b + a !== 0 && r + g + b + a < 255 * 4 * 0.9) {
        donneesImg.data[i] = r * pr;
        donneesImg.data[i + 1] = g * pg;
        donneesImg.data[i + 2] = b * pb;
      }
    }

    ctx.putImageData(donneesImg, 0, 0);
  }

  rendu(index) {
    const decalageYParDefaut = 5;

    let largeurTete = parseInt(this._imgTete.width);
    let hauteurTete = parseInt(this._imgTete.height);

    let demiLargeur = this.largeur * 0.5;
    let demiHauteur = this.hauteur * 0.5;
    const ctx = this._joueur.context;

    ctx.clearRect(0, 0, this.largeur, this.hauteur);

    // Dessine la tête
    ctx.drawImage(
      this._tete.canvas,
      demiLargeur - largeurTete * this.echelle * 0.5,
      decalageYParDefaut + demiHauteur - hauteurTete * this.echelle * 0.5,
      largeurTete * this.echelle,
      hauteurTete * this.echelle
    );

    const largeurSource = 30,
      hauteurSource = 50;
    const colonnes = 10,
      lignes = 9;

    // Le chapeau avec index 1 est le chapeau 7 dans l'image
    index += 6;
    const ligne = Math.floor(index / 10);
    const colonne = index % 10;

    const largeurSourceEchelle = largeurSource * this.echelle;
    const hauteurSourceEchelle = hauteurSource * this.echelle;

    // Dessine le chapeau
    ctx.drawImage(
      this._imgChapeaux,
      colonne * largeurSource,
      ligne * hauteurSource,
      largeurSource,
      hauteurSource,
      demiLargeur - largeurSourceEchelle * 0.5 - 2 * this.echelle,
      decalageYParDefaut +
        demiHauteur -
        hauteurSourceEchelle * 0.5 +
        1 * this.echelle,
      largeurSourceEchelle,
      hauteurSourceEchelle
    );

    return this._joueur.canvas.toDataURL();
  }

  // Alias pour compatibilité avec l'ancien code
  _colorHead(pr, pg, pb) {
    return this._colorerTete(pr, pg, pb);
  }

  render(index) {
    return this.rendu(index);
  }
}

// Fonction utilitaire (conservée pour compatibilité)
function renduChapeau(index) {
  // Fonction conservée pour compatibilité
}

// Alias pour compatibilité avec l'ancien code
const PlayerRenderer = AfficheurJoueur;
const renderHat = renduChapeau;
