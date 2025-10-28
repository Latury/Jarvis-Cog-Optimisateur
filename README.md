## 📋 Version Actuelle : v0.3.1

### ⚠️ État du Projet

**✅ Fonctionnel :**
- ✅ Chargement des données depuis [IdleonToolbox.com/data](https://idleontoolbox.com/data)
- ✅ Affichage des stats actuelles (Vitesse construction, Bonus XP, Taux Flaggy)
- ✅ Visualisation de la grille d'engrenages 8×12
- ✅ Inventaire de réserve avec pagination
- ✅ Console de logs intégrée pour débogage

**🚧 En développement :**
- ⚠️ Bouton "Optimiser" non testé en conditions réelles
- 🚧 Layout 3 colonnes à finaliser
- 🚧 Affichage des étapes de déplacement

> 📖 **Historique complet des versions :** [PATCHNOTES.md](PATCHNOTES.md)

---

### 🆕 Dernière mise à jour (28 octobre 2025)

**v0.3.1 - Correction critique du chargement des données**

**Problème résolu :**
- ✅ Bug de parsing JSON corrigé (ajout de `JSON.parse()` dans la fonction `load()`)
- ✅ Détection des données CogM/CogO/FlagP/FlagU fonctionnelle
- ✅ Logs de débogage détaillés ajoutés pour faciliter le diagnostic

**Ce qui a changé :**
- Modification de `index.html` : fonction `load()` corrigée
- Modification de `InventaireEngrenages.js` : ajout de logs de débogage

[📜 Voir toutes les versions →](PATCHNOTES.md)

---
