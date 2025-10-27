/**
 * ========================================
 * JARVIS COG OPTIMISATEUR - GESTION PAGES
 * ========================================
 */

class EvenementPage extends Event {
  page;
  dir;

  constructor(type, page, dir) {
    super(type);
    this.page = page;
    this.dir = dir;
  }
}

class GestionPages extends EventTarget {
  nombrePages = 1;
  indexPage = 0;

  _racine;
  _elemPrecedent;
  _elemPage;
  _elemSuivant;

  _nom;

  constructor(id, nombrePages, pageDepart = 1, nom = "Page") {
    super();

    this.nombrePages = nombrePages || 1;
    this.indexPage = Math.max(0, pageDepart - 1);

    this._nom = nom;

    this._racine = document.getElementById(id);
    if (!this._racine) {
      console.error(`❌ Élément avec id "${id}" introuvable !`);
      return;
    }

    if (!this._racine.classList.contains("paginator")) {
      this._racine.classList.add("paginator");
    }

    this._elemPrecedent = document.createElement("div");
    this._elemPrecedent.addEventListener("click", this.precedent.bind(this));
    this._racine.appendChild(this._elemPrecedent);

    this._elemPage = document.createElement("div");
    this._racine.appendChild(this._elemPage);

    this._elemSuivant = document.createElement("div");
    this._elemSuivant.addEventListener("click", this.suivant.bind(this));
    this._racine.appendChild(this._elemSuivant);

    this._mettreAJourPage();
  }

  _mettreAJourPage() {
    if (!this._elemPage) return;

    this._elemPage.innerText = `${this._nom} ${this.indexPage + 1}/${
      this.nombrePages
    }`;

    if (this._elemPrecedent) {
      this._elemPrecedent.className = this.indexPage > 0 ? "hasMore" : "";
    }

    if (this._elemSuivant) {
      this._elemSuivant.className =
        this.indexPage < this.nombrePages - 1 ? "hasMore" : "";
    }
  }

  reinitialiser(nombrePages, pageDepart = 0) {
    this.nombrePages = nombrePages || 1;

    if (pageDepart === undefined || pageDepart === null) {
      pageDepart = 0;
    } else {
      pageDepart = Math.max(0, Math.min(pageDepart, nombrePages - 1));
    }

    this.allerA(pageDepart);
  }

  allerA(page) {
    page = Math.max(0, Math.min(page, this.nombrePages - 1));
    const evenement = new EvenementPage("change", page, "goto");
    if (this.dispatchEvent(evenement)) {
      this.indexPage = page;
      this._mettreAJourPage();
    }
  }

  precedent(ev) {
    if (this.indexPage > 0) {
      const evenement = new EvenementPage("change", this.indexPage - 1, "prev");
      if (this.dispatchEvent(evenement)) {
        this.indexPage--;
        this._mettreAJourPage();
      }
    }
    if (ev) {
      ev.preventDefault();
    }
    return false;
  }

  suivant(ev) {
    if (this.indexPage < this.nombrePages - 1) {
      const evenement = new EvenementPage("change", this.indexPage + 1, "next");
      if (this.dispatchEvent(evenement)) {
        this.indexPage++;
        this._mettreAJourPage();
      }
    }
    if (ev) {
      ev.preventDefault();
    }
    return false;
  }

  // Alias pour compatibilité
  goto(page) {
    return this.allerA(page);
  }

  prev(ev) {
    return this.precedent(ev);
  }

  next(ev) {
    return this.suivant(ev);
  }

  reset(nombrePages, pageDepart) {
    return this.reinitialiser(nombrePages, pageDepart);
  }
}

const Paginator = GestionPages;
const PageEvent = EvenementPage;
