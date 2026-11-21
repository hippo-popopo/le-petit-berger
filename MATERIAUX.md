# Matériaux

La texture de prairie intégrée dans le fichier de ressources a été créée avec l’outil intégré ImageGen. Elle module le sol à deux échelles et suit l’éclairage et la pluie.

> Create one square seamless game ground material, orthographic top-down scan of a French pasture painted by hand in wet watercolor and opaque gouache on cold-pressed paper. Young meadow grasses in moss, sage and warm yellow-green, fine thin wisps discernible at centimeter scale, a few tiny ochre dried blades and earth peeking through the crowns. Rich but natural color, with pigment granulation and irregular overlapping brushstrokes, painted stylization inspired by botanical storybook set dressing. Dense texture without objects, rocks, flowers, stems casting shadows, landmarks, text, borders, directional lighting or perspective. Uniform lighting, similar density all the way to the edges, intended to be repeated as a low contrast 3D terrain sample. Avoid high contrast patterns and avoid a blurred or photographic grass carpet.

Le papier aquarelle, le paysage de la ferme, les illustrations de la carte et les études du troupeau et des accessoires ont été créés avec ImageGen. Les icônes d’équipement réutilisent la planche en format miniature. Les silhouettes du ciel, les nuages et les mouvements des végétaux sont générés dans le jeu.

## Mouton, bergerie et col

Le mouton est sculpté par sections dans le jeu. Son tronc et son visage ont chacun un maillage continu. La laine reçoit une carte de relief de 128 px et utilise un maillage allégé au loin. Les appuis, les oreilles et le museau gardent leurs pivots d’animation.

Le kit de bergerie en châtaignier a été créé dans Blender. Les poteaux, traverses et chapeaux sont exportés en buffers indexés dans le fichier du moteur. Le battant garde sa charnière. Les sapins neigeux et les crêtes sont générés lors du chargement des scènes. Dans l’archive, le dossier `sources-3d` contient le modèle Blender et les scripts de ces ressources.

Les grandes sorties dessinent les moutons dans sept groupes de maillages instanciés. Chaque mouton garde sa position et ses appuis animés. Les grottes utilisent une voûte ouverte aux deux extrémités, avec des collisions continues sur les flancs.

## Accessoires

Le foulard à carreaux utilise les coordonnées de la toile existante. La clochette est creuse. Le harnais et l’imperméable sont des maillages courbes fixés au tronc. Le dossier `sources-3d` de l’archive contient leurs définitions.

## Modèle jouable de Nuage

Le fichier `Border-Collie.blend` a été conservé dans le projet. Le jeu charge ses 1 951 965 triangles, ses 133 356 brins et ses trois textures de 4 096 × 4 096 pixels. Les données géométriques utilisent une compression gzip sans perte. Dans le jeu, chaque brin utilise les points et les rayons du fichier Blender.

## Animations

Les douze clips actifs de `Border-Collie-Jeu.glb` utilisent les 32 os du squelette de référence. `retarget_border_collie.py` exporte les courbes et `export_collie_weights.py` reporte les poids de `Border-Collie-Animations.blend` sur la géométrie complète. Le rendu préserve le volume autour des articulations. Les corrections de contact sollicitent les articulations existantes et le pelage suit la peau.

Les variantes indiquées « capture » dérivent des mouvements d’un labrador recueillis par Lei Han, Qingxu Zhu, Jiapeng Sheng, Chong Zhang, Tingguang Li, Yizheng Zhang et leurs coauteurs, 2024. Les mouvements ont été adaptés au Border Collie dans le GLB, puis à son squelette dans le jeu. [Jeu de données original](https://springernature.figshare.com/articles/dataset/Lifelike_Agility_and_Play_in_Quadrupedal_Robots_using_Reinforcement_Learning_and_Generative_Pre-trained_Models/24968946), [licence CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
