# Matériaux

La texture de prairie intégrée dans le fichier de ressources a été créée avec l’outil intégré ImageGen. Elle module le sol à deux échelles et suit l’éclairage et la pluie.

> Create one square seamless game ground material, orthographic top-down scan of a French pasture painted by hand in wet watercolor and opaque gouache on cold-pressed paper. Young meadow grasses in moss, sage and warm yellow-green, fine thin wisps discernible at centimeter scale, a few tiny ochre dried blades and earth peeking through the crowns. Rich but natural color, with pigment granulation and irregular overlapping brushstrokes, painted stylization inspired by botanical storybook set dressing. Dense texture without objects, rocks, flowers, stems casting shadows, landmarks, text, borders, directional lighting or perspective. Uniform lighting, similar density all the way to the edges, intended to be repeated as a low contrast 3D terrain sample. Avoid high contrast patterns and avoid a blurred or photographic grass carpet.

Le papier aquarelle, le paysage de la ferme, les illustrations de la carte et les études du troupeau et des accessoires ont été créés avec ImageGen. Les icônes d’équipement réutilisent la planche en format miniature. Les silhouettes du ciel, les nuages et les mouvements des végétaux sont générés dans le jeu.

## Mouton, bergerie et col

Le mouton est sculpté par sections dans le jeu. Son tronc et son visage ont chacun un maillage continu. La laine reçoit une carte de relief de 128 px et utilise un maillage allégé au loin. Les appuis, les oreilles et le museau gardent leurs pivots d’animation.

Le kit de bergerie en châtaignier a été créé dans Blender. Les poteaux, traverses et chapeaux sont exportés en buffers indexés dans le fichier du moteur. Le battant garde sa charnière. Les sapins neigeux et les crêtes sont générés lors du chargement des scènes. Dans l’archive, le dossier `sources-3d` contient le modèle Blender et les scripts de ces ressources.

Les grandes sorties dessinent les moutons dans sept groupes de maillages instanciés. Chaque mouton garde sa position et ses appuis animés. Les grottes utilisent une voûte ouverte aux deux extrémités, avec des collisions continues sur les flancs.

## Races et accessoires

Les silhouettes de chien partent du maillage de Nuage et adaptent les proportions, le squelette et les appuis. Références de morphologie de la Fédération Cynologique Internationale pour le [Welsh Corgi Cardigan](https://www.fci.be/fr/nomenclature/WELSH-CORGI-CARDIGAN-38.html), le [Berger blanc suisse](https://www.fci.be/fr/nomenclature/BERGER-BLANC-SUISSE-347.html) et le [Berger des Pyrénées à poil long](https://www.fci.be/fr/nomenclature/CHIEN-DE-BERGER-DES-PYRENEES-A-POIL-LONG-141.html).

Le foulard à carreaux utilise les coordonnées de la toile existante. La clochette est creuse. Le harnais et l’imperméable sont des maillages courbes fixés au tronc. Le dossier `sources-3d` de l’archive contient leurs définitions.

## Modèle jouable de Nuage

[border collie dog(mesh hair)](https://sketchfab.com/3d-models/border-collie-dogmesh-hair-516a1a06c6f248b6b8c28801eb1397ac) par [imdjs](https://sketchfab.com/imdjs), sous licence [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Adaptation pour Le Petit Berger avec ajout du squelette et des animations, ajustement des accessoires, variantes de couleur, textures réduites et matériaux adaptés au rendu Web.
