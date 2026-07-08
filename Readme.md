<div align="center">

## Nezuko-v1

[![Made with Baileys](https://img.shields.io/badge/Made%20with-Baileys-00bcd4?style=for-the-badge)](https://github.com/WhiskeySockets/Baileys)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<img src="utils/bot_image.jpg" alt="Nezuko-v1" width="260">

</div>

Nezuko-v1 est un bot WhatsApp MD ultra-rapide et léger basé sur la bibliothèque **Baileys**.  
Il est conçu pour être performant, stable et entièrement personnalisable directement depuis ses fichiers de configuration.

---

## ✨ Fonctionnalités

- **Optimisé pour Render** : Intègre un serveur HTTP Express natif pour tourner 24/7 sans aucun crash lié au port.
- **Gestion intelligente de la RAM** : Nettoyage agressif des fichiers temporaires, du cache de messages et suppression des caches Puppeteer pour éviter la saturation.
- **Personnalisation Simplifiée** : Nom du bot, préfixe, pack de stickers et numéro administrateur modifiables directement dans `config.js`.
- **Commandes de Modération & Utilitaires** : Gestion de groupes, alertes générales (`.tagall`), outils médias et système anti-liens inclus.

---

### 1. Fork du Dépôt

<div align="center">

<a href="" target="_blank">
  <img src="https://img.shields.io/badge/Fork%20Repository-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="Fork on GitHub">
</a>

</div>

> Crée ta propre copie de ce projet sur ton compte GitHub pour pouvoir le lier à ton service d'hébergement.

---

### 2. Configuration de la Session (Render QR Code System)

Ce bot est configuré pour générer son identifiant de connexion directement dans l'interface de déploiement.

1. Laisse le champ `sessionID` vide dans ton fichier `config.js`.
2. Déploie l'application sur **Render**.
3. Rends-toi dans l'onglet **Logs** de ton tableau de bord Render.
4. Un **QR Code** textuel s'affichera à l'écran : scanne-le avec l'option **Appareils connectés** de ton application WhatsApp pour l'activer.

---

### 3. Déploiement Tutoriel

Pour un guide pas à pas concernant l'installation et le déploiement sur les serveurs d'hébergement :

<div align="center">
  <a href="">
    <img src="https://img.shields.io/badge/Deploy Tutorial-dc3545?style=for-the-badge&logo=youtube" alt="YouTube Link"/>
  </a>
</div>

---

## 🛠 Configuration Locale (Optionnelle)

### 1️⃣ Cloner le dépôt
```bash
git clone 
cd Nezuko-v1
