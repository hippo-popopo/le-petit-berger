# Le Petit Berger

Jeu mobile 3D en paysage. Nuage rassemble les troupeaux en se plaçant du côté opposé à leur destination. La ferme propose une histoire en trois chapitres, neuf sorties libres, un chien à personnaliser et une boutique en graines gagnées en jeu.

## Jouer

Ouvre [le jeu publié](https://hippo-popopo.github.io/le-petit-berger/) dans Safari ou Chrome, puis ajoute-le à l’écran d’accueil. Au prochain lancement en ligne, le jeu récupère la version publiée. La progression est conservée dans le navigateur et le dernier chargement complet permet de rejouer hors connexion.

- **Pouce gauche** · déplace le joystick dans la direction souhaitée
- **Pouce droit** · glisse sur le terrain pour regarder. Le bouton ↻ replace la caméra derrière Nuage
- **Sprint** · maintiens le bouton pendant le déplacement
- **Aboyer** · aide à trouver les animaux cachés ou à exercer une pression brève
- **Ouvrir / Examiner** · apparaît près des portillons ou des traces
- **Pause** · permet de comparer le temps clair, l’heure dorée et la pluie

Au clavier, utilise les flèches, Maj, Espace, E pour interagir, R pour recentrer la caméra et P pour mettre en pause. La vitesse offerte par les croquettes et le regroupement du sifflet durent quelques secondes. Les anciennes étoiles sont récupérées au premier lancement.

## Développement local

Depuis ce dossier, lance `python3 -m http.server 8000` et ouvre `http://localhost:8000`. Les fichiers statiques se publient à la racine de la branche de déploiement, sans compilation.

- `index.html` contient l’interface et les styles.
- `game.js` contient le jeu, les missions, les commandes, l’éclairage et les modèles de la ferme.
- `assets.js` contient les textures intégrées et les données du modèle de Nuage.
- `sculpt_nuage.py` permet de régénérer le modèle et sa peinture dans Blender. La sortie `nuage.json` remplace l’objet `sculptedDog` dans `assets.js`. Le fichier source Blender possède quinze os, un maillage continu et des mèches séparées. Le jeu utilise des appuis de pattes sur le relief et des points d’attache au cou et sur le dos.
- `sw.js` et `manifest.webmanifest` gèrent le chargement hors connexion et l’installation.

## Crédits

Les animaux et les décors sont des modèles originaux du projet. Nuage est un border collie sculpté d’un seul tenant. Le papier et le lavis de prairie ont été générés avec ImageGen. Voir [les matériaux](MATERIAUX.md). Three.js est distribué sous licence MIT, reproduite dans `three.min.js`.
