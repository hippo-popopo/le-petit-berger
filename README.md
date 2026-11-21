# Le Petit Berger

Jeu mobile 3D en paysage. Nuage rassemble les troupeaux en se plaçant du côté opposé à leur destination. La campagne compte dix-huit missions sur des cartes distinctes et un bonus dans chacun des six biomes. Dans chaque bonus, pars de l’enclos, repère trois à cinq groupes voisins, réunis les 32 à 64 moutons et ramène-les. Le portail s’ouvre quand le troupeau est réuni. Le tutoriel se lance la première fois et reste accessible depuis les réglages.

## Jouer

Ouvre [le jeu publié](https://hippo-popopo.github.io/le-petit-berger/) dans Safari ou Chrome, puis ajoute-le à l’écran d’accueil. Au prochain lancement en ligne, le jeu récupère la version publiée. La progression est conservée dans le navigateur et le dernier chargement complet permet de rejouer hors connexion.

- **Pouce gauche** · déplace le joystick dans la direction souhaitée
- **Pouce droit** · glisse sur le terrain pour regarder. Le bouton ↻ replace la caméra derrière Nuage
- **Sprint** · maintiens le bouton pendant le déplacement
- **Aboyer** · exerce une pression brève sur les animaux à portée
- **Ouvrir / Examiner** · apparaît près des portillons ou des traces utiles pour se repérer
- **Carte** · agrandit la carte, permet de voir le troupeau dès le départ et met le jeu en pause
- **Pause** · permet de comparer le temps clair, l’heure dorée et la pluie

Au clavier, utilise les flèches, Maj, Espace, E pour interagir, J et L pour regarder, R pour recentrer la caméra et P pour mettre en pause. La vitesse offerte par les croquettes et le regroupement du sifflet durent quelques secondes. Les anciennes étoiles sont récupérées au premier lancement.

## Développement local

Depuis ce dossier, lance `python3 -m http.server 8000` et ouvre `http://localhost:8000`. Les fichiers statiques se publient à la racine de la branche de déploiement, sans compilation.

- `index.html` contient l’interface et les styles.
- `game-<version>.js` contient le jeu, les missions, les commandes, l’éclairage et les modèles de la ferme. Chaque version publiée garde son propre fichier pour que les anciennes installations chargent le bon moteur.
- `assets-<version>.js` contient les textures intégrées et les données du modèle de Nuage.
- `Nuage.blend` contient le modèle adapté et son squelette éditable, avec les textures intégrées. `sculpt_nuage.py` génère les données pour le jeu depuis le GLB d’origine, avec Blender et `sips` sur macOS. La sortie `nuage.json` remplace l’objet `sculptedDog` lors de la génération du fichier de ressources.
- `sw.js` et `manifest.webmanifest` gèrent le chargement hors connexion et l’installation.

## Crédits

Nuage est adapté du modèle [border collie dog(mesh hair) d’imdjs](https://sketchfab.com/3d-models/border-collie-dogmesh-hair-516a1a06c6f248b6b8c28801eb1397ac), sous licence [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Le jeu ajoute le squelette, les animations, les attaches d’accessoires, les variantes de robe et la préparation des textures pour le Web. Voir [les matériaux](MATERIAUX.md).

Le papier et le lavis de prairie ont été générés avec ImageGen. Three.js est distribué sous licence MIT, reproduite dans le fichier de la bibliothèque.
