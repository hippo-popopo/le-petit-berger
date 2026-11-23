# Le Petit Berger

Jeu mobile 3D en paysage. Le chien rassemble les troupeaux en se plaçant du côté opposé à leur destination. La campagne compte 150 niveaux dans 15 mondes, dont onze grands rassemblements de 32 à 96 moutons. Six contrats complètent la campagne. Les quatre derniers mondes se jouent avec des ressorts, des carillons, des rafales ou des lanternes. Termine les niveaux d’un monde pour accéder à sa finale chronométrée. Chaque chrono battu débloque une race de chien. Le premier monde permet de découvrir le jeu avec le Border Collie. Le tutoriel se lance la première fois et reste accessible depuis les réglages.

## Jouer

Ouvre [le jeu publié](https://hippo-popopo.github.io/le-petit-berger/) dans Safari ou Chrome, puis ajoute-le à l’écran d’accueil. Au prochain lancement en ligne, le jeu récupère la version publiée. La progression est conservée dans le navigateur et le dernier chargement complet permet de rejouer hors connexion.

- **Pouce gauche** · déplace le joystick dans la direction souhaitée
- **Pouce droit** · glisse sur le terrain pour regarder. Le bouton ↻ replace la caméra derrière Nuage
- **Sprint** · maintiens le bouton pendant le déplacement
- **Aboyer** · exerce une pression brève sur les animaux à portée
- **Ouvrir / Examiner** · apparaît près des portillons, des vannes et des traces
- **Sifflet** · ouvre les ordres Rassembler, Tenir et Trier lorsque la ferme avance ou que la mission les enseigne
- **Carte** · met le jeu en pause et montre les animaux, les passages et les objectifs. Utilise « Autour du chien » pour inspecter les alentours
- **Pause** · affiche l’objectif et donne accès aux conseils, au son et à la météo

Au clavier, utilise les flèches, Maj, Espace, E pour interagir, F pour ouvrir le sifflet, J et L pour regarder, R pour recentrer la caméra et P pour mettre en pause. La vitesse offerte par les croquettes et le regroupement du sifflet durent quelques secondes. Les anciennes étoiles sont récupérées au premier lancement.

## Développement local

Depuis ce dossier, lance `python3 -m http.server 8000` et ouvre `http://localhost:8000`. Les fichiers statiques se publient à la racine de la branche de déploiement, sans compilation.

- `index.html` contient l’interface et les styles.
- `game-<version>.js` contient le jeu, les missions, les commandes, l’éclairage et les modèles de la ferme. Chaque version publiée garde son propre fichier pour que les anciennes installations chargent le bon moteur.
- `assets-<version>.js` contient les illustrations du jeu et référence les fichiers des quinze races de chiens et de leurs équipements.
- `export_pack_web.py` et `retarget_border_collie.py` exportent les modèles, matériaux et animations pour le navigateur à partir des ressources normalisées pour Unreal.
- `sw.js` et `manifest.webmanifest` gèrent le chargement hors connexion et l’installation.

## Crédits

Le jeu utilise les maillages, robes et clips fournis dans le Pack Chiens de Berger. Les quinze races et leurs 88 robes figurent dans Chien, dont les douze races du Pack 12 Races Chiens 3D. Voir [les matériaux et les crédits des animations](MATERIAUX.md).

Le papier et le lavis de prairie ont été générés avec ImageGen. Three.js est distribué sous licence MIT, reproduite dans le fichier de la bibliothèque.
