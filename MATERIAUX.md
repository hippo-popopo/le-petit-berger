# Matériaux

La texture de prairie intégrée dans le fichier de ressources a été créée avec l’outil intégré ImageGen. Elle module le sol à deux échelles et suit l’éclairage et la pluie.

> Create one square seamless game ground material, orthographic top-down scan of a French pasture painted by hand in wet watercolor and opaque gouache on cold-pressed paper. Young meadow grasses in moss, sage and warm yellow-green, fine thin wisps discernible at centimeter scale, a few tiny ochre dried blades and earth peeking through the crowns. Rich but natural color, with pigment granulation and irregular overlapping brushstrokes, painted stylization inspired by botanical storybook set dressing. Dense texture without objects, rocks, flowers, stems casting shadows, landmarks, text, borders, directional lighting or perspective. Uniform lighting, similar density all the way to the edges, intended to be repeated as a low contrast 3D terrain sample. Avoid high contrast patterns and avoid a blurred or photographic grass carpet.

Le papier aquarelle, le paysage de la ferme, les illustrations de la carte et les études du troupeau et des accessoires ont été créés avec ImageGen. Les icônes d’équipement réutilisent la planche en format miniature. Les silhouettes du ciel, les nuages et les mouvements des végétaux sont générés dans le jeu.

## Mouton, bergerie et col

La toison des moutons et les nouveaux volumes du canard, de la chèvre et du cochon sont modélisés dans Blender. Les modèles proches et distants des moutons partagent le même profil. La laine reçoit une carte de relief de 128 px et utilise un maillage allégé au loin. Les appuis, les oreilles et le museau gardent leurs pivots d’animation.

Le kit de bergerie en châtaignier a été créé dans Blender. Les poteaux, traverses et chapeaux sont exportés en buffers indexés dans le fichier du moteur. Le battant garde sa charnière. Blender fournit le granite des murets et les nouvelles cimes à feuilles animées. Le jeu génère les sapins neigeux, les crêtes et les couches du ciel. Dans l’archive, le dossier `sources-3d` contient le modèle Blender et les scripts de ces ressources.

Les grandes sorties dessinent les moutons dans sept groupes de maillages instanciés. Chaque mouton garde sa position et ses appuis animés. Les grottes utilisent une voûte ouverte aux deux extrémités, avec des collisions continues sur les flancs.

## Accessoires

Le foulard à carreaux utilise les coordonnées de la toile existante. La clochette est creuse. Le harnais et l’imperméable sont des maillages courbes fixés au tronc. Le dossier `sources-3d` de l’archive contient leurs définitions.

## Chiens de berger

Le Border Collie, le Berger Australien et le Berger des Shetland utilisent chacun leur propre maillage et leur propre squelette. Les seize robes chargent à la demande. Les cartes de normales et de rugosité sont importées des modèles fournis et les accessoires suivent les points d’attache du cou et du thorax. Le poids entre le bassin et chaque cuisse a été repeint dans Blender pour entraîner progressivement le volume du haut de la patte.

## Animations

Blender échantillonne les clips pour chaque squelette, à 60 images par seconde. Unreal permet de contrôler les chaînes articulaires et leur longueur. La marche, le trot, les deux galops, les virages, l’approche du troupeau et les animations de repos utilisent les courbes des fichiers du pack. Le jeu interpole les poses. À l'arrière, la hanche reste solidaire du bassin et le fémur et le tibia fléchissent pour suivre le relief en gardant la longueur des segments et l’orientation du pied.

Les variantes indiquées « capture » dérivent des mouvements d’un labrador recueillis par Lei Han, Qingxu Zhu, Jiapeng Sheng, Chong Zhang, Tingguang Li, Yizheng Zhang et leurs coauteurs, 2024. Les mouvements ont été adaptés au Border Collie dans le GLB, puis à son squelette dans le jeu. [Jeu de données original](https://springernature.figshare.com/articles/dataset/Lifelike_Agility_and_Play_in_Quadrupedal_Robots_using_Reinforcement_Learning_and_Generative_Pre-trained_Models/24968946), [licence CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
