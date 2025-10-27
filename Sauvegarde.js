/**
 * Sauvegarde.js
 * Gère la sauvegarde et le chargement des configurations
 * Utilise localStorage pour stocker les données dans le navigateur
 */

class GestionnaireSauvegarde {
  constructor() {
    // Nom de la clé pour stocker la configuration actuelle
    this.cleConfiguration = "jarvis_cog_config_actuelle";

    // Nom de la clé pour stocker les paramètres d'optimisation
    this.cleParametres = "jarvis_cog_parametres";

    // Nom de la clé pour activer/désactiver la sauvegarde auto
    this.cleSauvegardeAuto = "jarvis_cog_sauvegarde_auto";

    // Activer la sauvegarde automatique par défaut
    this.sauvegardeAutoActive = this.obtenirSauvegardeAuto();
  }

  /**
   * Sauvegarder la configuration actuelle
   * @param {Object} configuration - Les données de configuration à sauvegarder
   * @returns {boolean} - true si la sauvegarde a réussi
   */
  sauvegarderConfiguration(configuration) {
    try {
      // Convertir l'objet en texte JSON
      const json = JSON.stringify(configuration);

      // Stocker dans localStorage
      localStorage.setItem(this.cleConfiguration, json);

      // Ajouter la date de sauvegarde
      const maintenant = new Date().toISOString();
      localStorage.setItem(this.cleConfiguration + "_date", maintenant);

      console.log("✅ Configuration sauvegardée avec succès");
      return true;
    } catch (erreur) {
      console.error("❌ Erreur lors de la sauvegarde:", erreur);
      return false;
    }
  }

  /**
   * Charger la dernière configuration sauvegardée
   * @returns {Object|null} - La configuration ou null si aucune sauvegarde
   */
  chargerConfiguration() {
    try {
      // Récupérer le JSON depuis localStorage
      const json = localStorage.getItem(this.cleConfiguration);

      // Si aucune sauvegarde n'existe
      if (!json) {
        console.log("ℹ️ Aucune configuration sauvegardée trouvée");
        return null;
      }

      // Convertir le JSON en objet
      const configuration = JSON.parse(json);

      // Récupérer la date de sauvegarde
      const date = localStorage.getItem(this.cleConfiguration + "_date");

      console.log("✅ Configuration chargée depuis:", date);
      return configuration;
    } catch (erreur) {
      console.error("❌ Erreur lors du chargement:", erreur);
      return null;
    }
  }

  /**
   * Sauvegarder les paramètres d'optimisation (poids)
   * @param {Object} parametres - Les paramètres à sauvegarder
   */
  sauvegarderParametres(parametres) {
    try {
      const json = JSON.stringify(parametres);
      localStorage.setItem(this.cleParametres, json);
      console.log("✅ Paramètres sauvegardés");
      return true;
    } catch (erreur) {
      console.error("❌ Erreur sauvegarde paramètres:", erreur);
      return false;
    }
  }

  /**
   * Charger les paramètres d'optimisation
   * @returns {Object|null} - Les paramètres ou null
   */
  chargerParametres() {
    try {
      const json = localStorage.getItem(this.cleParametres);
      if (!json) return null;

      return JSON.parse(json);
    } catch (erreur) {
      console.error("❌ Erreur chargement paramètres:", erreur);
      return null;
    }
  }

  /**
   * Activer ou désactiver la sauvegarde automatique
   * @param {boolean} actif - true pour activer, false pour désactiver
   */
  definirSauvegardeAuto(actif) {
    this.sauvegardeAutoActive = actif;
    localStorage.setItem(this.cleSauvegardeAuto, actif ? "oui" : "non");
    console.log(
      actif ? "✅ Sauvegarde auto activée" : "⚠️ Sauvegarde auto désactivée"
    );
  }

  /**
   * Vérifier si la sauvegarde auto est activée
   * @returns {boolean}
   */
  obtenirSauvegardeAuto() {
    const valeur = localStorage.getItem(this.cleSauvegardeAuto);
    // Par défaut, la sauvegarde auto est activée
    return valeur === null || valeur === "oui";
  }

  /**
   * Supprimer toutes les sauvegardes
   */
  effacerTout() {
    if (
      confirm("⚠️ Êtes-vous sûr de vouloir effacer toutes les sauvegardes ?")
    ) {
      localStorage.removeItem(this.cleConfiguration);
      localStorage.removeItem(this.cleConfiguration + "_date");
      localStorage.removeItem(this.cleParametres);
      console.log("🗑️ Toutes les sauvegardes ont été effacées");
      return true;
    }
    return false;
  }

  /**
   * Obtenir la date de la dernière sauvegarde
   * @returns {string|null} - La date ou null
   */
  obtenirDateDerniereSauvegarde() {
    return localStorage.getItem(this.cleConfiguration + "_date");
  }

  /**
   * Vérifier si une sauvegarde existe
   * @returns {boolean}
   */
  sauvegardeExiste() {
    return localStorage.getItem(this.cleConfiguration) !== null;
  }
}
// Créer une instance globale
const sauvegarde = new GestionnaireSauvegarde();

console.log("💾 Système de sauvegarde initialisé");
