# Le Petit Berger

Jeu mobile 3D en paysage. Nuage rassemble les troupeaux en se plaçant du côté opposé à leur destination. Les neuf missions servent à explorer les commandes, le terrain et les réactions des espèces.

## Jouer

Si GitHub Pages est activé pour ce dépôt, l’adresse de jeu apparaît dans **Settings → Pages**. Ouvre-la dans Safari ou Chrome, puis ajoute le jeu à l’écran d’accueil. Au prochain lancement en ligne, le jeu récupère la version publiée. La progression est conservée dans le navigateur et le dernier chargement complet permet de rejouer hors connexion.

- **Pouce gauche** · joystick pour avancer, reculer et tourner
- **Pouce droit** · glisse sur le terrain pour regarder
- **Sprint** · maintiens le bouton pendant le déplacement
- **Aboyer** · aide à trouver les animaux cachés ou à exercer une pression brève
- **Ouvrir / Examiner** · apparaît près des portillons ou des traces
- **Pause** · permet de comparer le temps clair, l’heure dorée et la pluie

Au clavier, utilise les flèches, Maj, Espace, E pour interagir et P pour mettre en pause.

## Développement local

Depuis ce dossier, lance `python3 -m http.server 8000` et ouvre `http://localhost:8000`. Les fichiers statiques se publient à la racine de la branche de déploiement, sans compilation.

- `index.html` contient l’interface et les styles.
- `game.js` contient le jeu, les missions, les commandes, l’éclairage et les modèles de la ferme.
- `assets.js` contient les textures intégrées et les données du modèle de Nuage.
- `sculpt_nuage.py` permet de régénérer le modèle et sa peinture dans Blender. La sortie `nuage.json` remplace l’objet `sculptedDog` dans `assets.js`. Nuage possède quinze os, quatre pattes animées par appuis et des points d’attache au cou et sur le dos.
- `sw.js` et `manifest.webmanifest` gèrent le chargement hors connexion et l’installation.

## Crédits

Les animaux et les décors sont des modèles originaux du projet. Nuage est un border collie sculpté d’un seul tenant. Le papier et le lavis de prairie ont été générés avec ImageGen. Voir [les matériaux](MATERIAUX.md). Three.js est distribué sous licence MIT, reproduite dans `three.min.js`.
