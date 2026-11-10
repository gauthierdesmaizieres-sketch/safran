// Fiches nutrition : contenu statique, lu par src/screens/Learn.jsx.
// shortcut: French only (not in i18n.js, too long for its rows); translate here as { fr, de, en } if a de/en user needs them.
// Body items: a string is a paragraph, an array is a bullet list. Figures are adult reference values.

const doi = id => `https://doi.org/${id}`
const S = {
  anses: { label: 'Anses (2016-2021). Références nutritionnelles pour la population (RNP, AS) et actualisation des repères du PNNS.', url: 'https://www.anses.fr' },
  efsaDrv: { label: 'EFSA. Dietary Reference Values (DRV Finder).', url: 'https://multimedia.efsa.europa.eu/drvs/index.htm' },
  who: { label: 'OMS (2020). Healthy diet, fact sheet n° 394.', url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet' },
  efsaFat: { label: 'EFSA NDA Panel (2010). Scientific opinion on dietary reference values for fats. EFSA J 8(3):1461.', url: doi('10.2903/j.efsa.2010.1461') },
  efsaCarb: { label: 'EFSA NDA Panel (2010). Dietary reference values for carbohydrates and dietary fibre. EFSA J 8(3):1462.', url: doi('10.2903/j.efsa.2010.1462') },
  reynolds: { label: 'Reynolds A. et al. (2019). Carbohydrate quality and human health: systematic reviews and meta-analyses. The Lancet 393:434-445.', url: doi('10.1016/S0140-6736(18)31809-9') },
  hooper: { label: 'Hooper L. et al. (2020). Reduction in saturated fat intake for cardiovascular disease. Cochrane Database Syst Rev.', url: doi('10.1002/14651858.CD011737.pub3') },
  atkinson: { label: "Atkinson F. et al. (2021). International tables of glycemic index and glycemic load values 2021. Am J Clin Nutr 114:1625-1632.", url: doi('10.1093/ajcn/nqab233') },
  hall: { label: 'Hall K. et al. (2011). Quantification of the effect of energy imbalance on bodyweight. The Lancet 378:826-837.', url: doi('10.1016/S0140-6736(11)60812-X') },
  morton: { label: 'Morton R. et al. (2018). Protein supplementation and resistance training: a meta-analysis. Br J Sports Med 52:376-384.', url: doi('10.1136/bjsports-2017-097608') },
  hill: { label: 'Hill C. et al. (2014). ISAPP consensus statement on the scope and appropriate use of the term probiotic. Nat Rev Gastroenterol Hepatol 11:506-514.', url: doi('10.1038/nrgastro.2014.66') },
  gibson: { label: 'Gibson G. et al. (2017). ISAPP consensus statement on the definition and scope of prebiotics. Nat Rev Gastroenterol Hepatol 14:491-502.', url: doi('10.1038/nrgastro.2017.75') },
  wastyk: { label: 'Wastyk H. et al. (2021). Gut-microbiota-targeted diets modulate human immune status. Cell 184:4137-4153.', url: doi('10.1016/j.cell.2021.06.019') },
  sender: { label: 'Sender R. et al. (2016). Revised estimates for the number of human and bacteria cells in the body. PLoS Biol 14:e1002533.', url: doi('10.1371/journal.pbio.1002533') },
  fao: { label: 'FAO (2013). Dietary protein quality evaluation in human nutrition (DIAAS). FAO Food and Nutrition Paper 92.' },
  inco: { label: 'Règlement (UE) n° 1169/2011, annexe XIV : coefficients de conversion énergétique.' },
}

export const SHEETS = [
  {
    id: 'energie',
    title: 'Énergie et métabolisme',
    summary: "D'où viennent les calories, où elles partent, et pourquoi le poids ne suit pas une règle de trois.",
    facts: [
      ['Glucides, protéines', '4 kcal/g'],
      ['Lipides', '9 kcal/g'],
      ['Alcool', '7 kcal/g'],
      ['Fibres', '2 kcal/g'],
    ],
    sections: [
      { h: 'La calorie', body: [
        "Une kilocalorie (kcal) est l'énergie qui élève 1 kg d'eau de 1 °C. Les étiquettes affichent aussi des kilojoules : 1 kcal = 4,184 kJ.",
        "Les valeurs ci-dessus sont les coefficients d'Atwater, utilisés par la réglementation européenne. Ce sont des moyennes : l'énergie réellement absorbée varie avec la matrice de l'aliment (une amande entière libère moins d'énergie que la même amande en purée), la cuisson et le microbiote.",
      ] },
      { h: 'Où part l\'énergie', body: [
        [
          'Métabolisme de base : 60 à 70 % de la dépense. Cerveau, foie, cœur, reins et muscles au repos. Il dépend surtout de la masse maigre.',
          "Effet thermique des aliments : environ 10 %. C'est le coût de la digestion et du stockage : 20 à 30 % de l'énergie des protéines, 5 à 10 % pour les glucides, 0 à 3 % pour les lipides.",
          'Activité physique : le poste le plus variable, y compris les mouvements du quotidien (NEAT : marcher, se lever, gesticuler).',
        ],
      ] },
      { h: 'Bilan énergétique et poids', body: [
        "Le poids évolue selon la différence entre apports et dépenses, mais pas de façon linéaire. La règle « 7 700 kcal = 1 kg » surestime la perte à long terme : quand on maigrit, la dépense baisse (moins de masse à porter, adaptation métabolique). Les modèles dynamiques (Hall, 2011) prédisent qu'un déficit stable de 100 kcal/jour mène à environ −5 kg en 3 ans, avec un plateau atteint progressivement.",
        "Le poids quotidien fluctue aussi de 1 à 2 kg avec l'eau : chaque gramme de glycogène stocké retient environ 3 g d'eau, et le sel fait retenir de l'eau. Une tendance sur 2 à 3 semaines est plus fiable qu'une pesée isolée.",
      ] },
    ],
    sources: [S.inco, S.hall, S.anses],
  },
  {
    id: 'proteines',
    title: 'Protéines',
    summary: 'Acides aminés essentiels, qualité des protéines, besoins selon le profil et répartition dans la journée.',
    facts: [
      ['Besoin adulte (RNP Anses)', '0,83 g/kg/jour'],
      ['Sportif en musculation', '1,2 à 1,6 g/kg/jour'],
      ['Personne de plus de 65 ans', '1,0 à 1,2 g/kg/jour'],
      ['Acides aminés essentiels', '9'],
    ],
    sections: [
      { h: 'Structure et rôle', body: [
        "Une protéine est une chaîne d'acides aminés reliés par des liaisons peptidiques. Le corps en fabrique des dizaines de milliers : muscles (actine, myosine), enzymes, hormones (insuline), anticorps, transporteurs (hémoglobine), structure (collagène, kératine).",
        "Les protéines du corps sont renouvelées en permanence, environ 250 à 300 g par jour chez l'adulte. Les apports alimentaires compensent les acides aminés oxydés ou perdus. Il n'existe pas de réserve de protéines : un excès est oxydé pour l'énergie ou converti en glucose ou en graisse.",
      ] },
      { h: 'Les 9 acides aminés essentiels', body: [
        "Le corps ne sait pas les synthétiser : histidine, isoleucine, leucine, lysine, méthionine, phénylalanine, thréonine, tryptophane, valine. Les autres (11 sur 20) sont fabriqués à partir d'autres molécules.",
        "La leucine joue un rôle de signal : elle active la voie mTORC1, qui déclenche la synthèse des protéines musculaires. Il en faut environ 2 à 3 g par repas pour un effet maximal chez l'adulte jeune, davantage après 65 ans (« résistance anabolique »).",
      ] },
      { h: 'Qualité : toutes les protéines ne se valent pas', body: [
        "La qualité d'une protéine dépend de sa digestibilité et de son profil en acides aminés essentiels. La FAO recommande le score DIAAS : il compare la teneur de chaque acide aminé digestible à un profil de référence. Le lait, l'œuf et la viande dépassent 100. Les protéines végétales sont souvent limitées par un acide aminé : la lysine pour les céréales, la méthionine pour les légumineuses.",
        "Associer céréales et légumineuses dans la journée (riz et lentilles, pain et houmous) compense ces limites. Il n'est pas nécessaire de les combiner dans le même repas.",
      ] },
      { h: 'Besoins et répartition', body: [
        "La RNP de l'Anses (0,83 g/kg/jour) couvre les besoins de 97,5 % des adultes sédentaires. Elle est plus élevée chez la personne âgée, la femme enceinte et le sportif. Une méta-analyse de 49 essais (Morton, 2018) montre que le gain de masse musculaire avec l'entraînement plafonne vers 1,6 g/kg/jour.",
        "Répartir 0,3 à 0,4 g/kg par repas sur 3 à 4 repas stimule mieux la synthèse musculaire qu'un seul gros apport le soir. Les protéines sont aussi les plus rassasiantes des macronutriments.",
        "Chez l'adulte en bonne santé, des apports jusqu'à environ 2 g/kg/jour ne montrent pas d'effet néfaste sur des reins sains. En cas de maladie rénale, l'apport se discute avec un médecin.",
      ] },
    ],
    sources: [S.anses, S.fao, S.morton, S.efsaDrv],
  },
  {
    id: 'glucides',
    title: 'Glucides et sucres',
    summary: 'Sucres simples, amidon, index et charge glycémique : ce que deviennent les glucides dans le corps.',
    facts: [
      ['Part des apports (Anses)', '40 à 55 % de l\'énergie'],
      ['Sucres hors lactose (Anses)', 'moins de 100 g/jour'],
      ['Sucres libres (OMS)', 'moins de 10 %, idéalement 5 %'],
      ['Besoin du cerveau', 'environ 120 g de glucose/jour'],
    ],
    sections: [
      { h: 'Les familles de glucides', body: [
        [
          'Monosaccharides : glucose, fructose, galactose. Absorbés tels quels par l\'intestin.',
          'Disaccharides : saccharose (glucose + fructose, le sucre de table), lactose (glucose + galactose), maltose.',
          "Polysaccharides : l'amidon (céréales, pommes de terre, légumineuses), chaîne de milliers de glucoses. Il existe sous deux formes : l'amylose, linéaire et digérée lentement, et l'amylopectine, ramifiée et digérée vite.",
          'Fibres : polysaccharides que nos enzymes ne savent pas couper. Elles ont leur propre fiche.',
        ],
        "Sur une étiquette, « glucides » regroupe sucres et amidon ; « dont sucres » ne compte que les mono- et disaccharides, qu'ils soient naturellement présents ou ajoutés.",
      ] },
      { h: 'Ce que devient le glucose', body: [
        "Après absorption, la glycémie monte et le pancréas libère de l'insuline, qui fait entrer le glucose dans les muscles et le tissu adipeux. Le glucose est utilisé tout de suite (glycolyse), ou stocké en glycogène : environ 100 g dans le foie et 400 g dans les muscles. La conversion massive du glucose en graisse (lipogenèse de novo) reste faible chez l'humain, sauf en cas d'excès important et prolongé.",
        "Le fructose suit une autre voie : il est capté surtout par le foie, sans passer par l'étape de régulation de la glycolyse (phosphofructokinase). En excès, notamment sous forme de boissons sucrées, il favorise la production de graisse dans le foie et la hausse des triglycérides sanguins. Le fructose des fruits entiers, accompagné de fibres et d'eau, n'a pas cet effet aux quantités habituelles.",
      ] },
      { h: 'Index et charge glycémique', body: [
        "L'index glycémique (IG) compare la hausse de glycémie après 50 g de glucides d'un aliment à celle du glucose pur (100). Il est bas jusqu'à 55, moyen de 56 à 69, élevé à partir de 70. Il dépend de la structure de l'amidon, des fibres, des graisses et des protéines du repas, de la cuisson (des pâtes al dente ont un IG plus bas que des pâtes trop cuites) et de la maturité des fruits.",
        "La charge glycémique (CG) tient compte de la portion : CG = IG × glucides de la portion (g) / 100. Elle est basse jusqu'à 10, élevée à partir de 20. La pastèque a un IG élevé (environ 75) mais une CG basse pour une tranche, car elle contient peu de glucides.",
        "Amidon résistant : un féculent cuit puis refroidi (riz, pommes de terre, pâtes) voit une partie de son amidon se réorganiser (rétrogradation). Cette fraction échappe à la digestion et se comporte comme une fibre.",
      ] },
      { h: 'Qualité plutôt que quantité', body: [
        "Les méta-analyses commandées par l'OMS (Reynolds, 2019) associent les céréales complètes et les apports élevés en fibres à moins de maladies cardiovasculaires, de diabète de type 2 et de cancer colorectal. L'effet de l'IG seul est plus faible que celui des fibres.",
      ] },
    ],
    sources: [S.anses, S.who, S.atkinson, S.reynolds, S.efsaCarb],
  },
  {
    id: 'fibres',
    title: 'Fibres alimentaires',
    summary: 'Solubles ou insolubles, fermentation par le microbiote et effets mesurés sur la santé.',
    facts: [
      ['Apport conseillé (Anses)', '30 g/jour'],
      ['Apport moyen en France', 'environ 20 g/jour'],
      ['Bêta-glucanes d\'avoine', '3 g/jour baissent le LDL'],
      ['Énergie', '2 kcal/g'],
    ],
    sections: [
      { h: 'Définition', body: [
        "Les fibres sont des glucides (et la lignine) que l'intestin grêle ne digère pas. Elles arrivent intactes dans le côlon, où une partie est fermentée par les bactéries.",
      ] },
      { h: 'Deux grandes familles', body: [
        [
          "Solubles : pectines (pommes, agrumes), bêta-glucanes (avoine, orge), gommes, inuline (chicorée, poireau, oignon). Elles forment un gel visqueux qui ralentit la vidange de l'estomac et l'absorption du glucose, et piège une partie des acides biliaires, ce qui oblige le foie à puiser dans le cholestérol pour en refaire.",
          "Insolubles : cellulose, hémicelluloses, lignine (son de blé, céréales complètes, peau des fruits et légumes). Elles retiennent l'eau, augmentent le volume des selles et accélèrent le transit.",
        ],
        "La plupart des végétaux contiennent les deux types. La classification la plus utile aujourd'hui tient compte de la viscosité et de la fermentescibilité plutôt que de la seule solubilité.",
      ] },
      { h: 'Fermentation et acides gras à chaîne courte', body: [
        "Dans le côlon, les bactéries fermentent les fibres et produisent des acides gras à chaîne courte (AGCC) : acétate, propionate et butyrate, dans un rapport d'environ 60:20:20. Le butyrate est le carburant principal des cellules du côlon et renforce la barrière intestinale. Le propionate rejoint le foie et participe à la régulation de la glycémie. Les AGCC agissent aussi comme signaux sur les hormones de satiété (GLP-1, PYY).",
        "Les gaz (hydrogène, CO₂, méthane) sont un produit normal de cette fermentation. Augmenter les fibres progressivement, sur 2 à 3 semaines, et boire suffisamment limite les ballonnements.",
      ] },
      { h: 'Effets démontrés', body: [
        "Selon Reynolds (2019), passer de moins de 15 g à 25-29 g de fibres par jour s'accompagne de 15 à 30 % de baisse de la mortalité toutes causes, des maladies coronariennes, du diabète de type 2 et du cancer colorectal. L'EFSA a validé l'allégation selon laquelle 3 g par jour de bêta-glucanes d'avoine ou d'orge réduisent le cholestérol LDL.",
      ] },
    ],
    sources: [S.anses, S.reynolds, S.efsaCarb],
  },
  {
    id: 'lipides',
    title: 'Lipides et acides gras',
    summary: 'Saturés, mono- et polyinsaturés, oméga-3 et 6, trans : structure, rôles et repères.',
    facts: [
      ['Lipides totaux (Anses)', '35 à 40 % de l\'énergie'],
      ['Acides gras saturés', '12 % max de l\'énergie'],
      ['Oméga-6 (acide linoléique)', '4 % de l\'énergie'],
      ['Oméga-3 (ALA)', '1 % de l\'énergie'],
      ['EPA + DHA', '500 mg/jour'],
      ['Acides gras trans (OMS)', 'moins de 1 % de l\'énergie'],
    ],
    sections: [
      { h: 'Rôles', body: [
        "Les lipides fournissent la réserve d'énergie la plus dense du corps (9 kcal/g). Ils forment les membranes de toutes les cellules (phospholipides, cholestérol), servent à fabriquer des hormones (stéroïdes) et des médiateurs de l'inflammation (eicosanoïdes), et permettent l'absorption des vitamines liposolubles A, D, E et K. Le cerveau est constitué à environ 60 % de lipides (en masse sèche), riches en DHA.",
        "Dans les aliments, ils sont surtout sous forme de triglycérides : un glycérol portant trois acides gras.",
      ] },
      { h: 'Saturés, insaturés : une question de doubles liaisons', body: [
        [
          "Saturés (AGS) : aucune double liaison, chaîne droite, solides à température ambiante. Acide palmitique (C16:0), stéarique (C18:0), myristique, laurique. Sources : beurre, fromage, viande, huiles de palme et de coco.",
          "Monoinsaturés (AGMI) : une double liaison. Surtout l'acide oléique (C18:1 oméga-9). Sources : huile d'olive, de colza, avocat, amandes.",
          "Polyinsaturés (AGPI) : deux doubles liaisons ou plus. On les classe par la position de la première double liaison à partir de l'extrémité de la chaîne : oméga-6 ou oméga-3.",
        ],
        "La notation C18:2 n-6 signifie : 18 carbones, 2 doubles liaisons, la première sur le 6e carbone en partant de l'extrémité méthyle.",
      ] },
      { h: 'Oméga-6 et oméga-3', body: [
        "Deux acides gras sont indispensables, car nous ne savons pas créer de double liaison à ces positions : l'acide linoléique (LA, oméga-6 : huiles de tournesol, de pépins de raisin, noix) et l'acide alpha-linolénique (ALA, oméga-3 : huiles de colza, de lin, de noix, graines de chia).",
        "L'ALA peut être allongé en EPA puis en DHA, mais la conversion est faible chez l'humain : quelques pour cent pour l'EPA, moins de 1 % pour le DHA. Les poissons gras (sardine, maquereau, saumon, hareng) en apportent directement. Une à deux portions par semaine couvrent les repères. L'EPA et le DHA participent à la structure de la rétine et du cerveau, et donnent des médiateurs anti-inflammatoires (résolvines).",
        "Oméga-6 et oméga-3 utilisent les mêmes enzymes. L'alimentation occidentale apporte souvent un rapport LA/ALA de 10 à 15 ; l'Anses vise moins de 5.",
      ] },
      { h: 'Acides gras saturés et cholestérol', body: [
        "Certains AGS (laurique, myristique, palmitique) élèvent le cholestérol LDL en réduisant l'activité des récepteurs qui l'épurent dans le foie. La revue Cochrane (Hooper, 2020) montre que réduire les AGS diminue de 17 % les événements cardiovasculaires, surtout quand ils sont remplacés par des acides gras polyinsaturés, moins quand ils le sont par des sucres. La source compte aussi : la matrice des produits laitiers fermentés semble atténuer cet effet.",
        "Le cholestérol alimentaire (œufs, abats) a un effet modéré sur le LDL sanguin chez la plupart des gens, car le foie ajuste sa propre production.",
      ] },
      { h: 'Acides gras trans', body: [
        "Une double liaison en configuration « trans » rend la chaîne droite, comme un acide gras saturé. Les trans industriels, issus de l'hydrogénation partielle des huiles, sont les plus nocifs : ils montent le LDL et baissent le HDL. Ils sont limités en Europe à 2 g pour 100 g de graisse depuis 2021. Les trans naturels des produits laitiers et de la viande de ruminants sont présents en petites quantités.",
      ] },
    ],
    sources: [S.anses, S.efsaFat, S.hooper, S.who],
  },
  {
    id: 'microbiote',
    title: 'Microbiote, probiotiques, prébiotiques',
    summary: 'Ce que contient le côlon, ce que les définitions scientifiques disent vraiment, et ce qui est prouvé.',
    facts: [
      ['Bactéries dans le côlon', 'environ 38 000 milliards'],
      ['Espèces chez une personne', 'quelques centaines'],
      ['Allégation santé « probiotique » autorisée en UE', 'aucune'],
    ],
    sections: [
      { h: 'Le microbiote intestinal', body: [
        "Le côlon héberge un écosystème d'environ 38 000 milliards de bactéries, autant que de cellules humaines, dominé par deux grands groupes : les Firmicutes (Bacillota) et les Bacteroidetes (Bacteroidota). Il fermente les fibres, produit des vitamines (K2, certaines vitamines B), transforme les acides biliaires, entraîne le système immunitaire et occupe la place des pathogènes.",
        "Sa composition varie fortement d'une personne à l'autre. Sa diversité est associée à une alimentation riche et variée en végétaux. Un microbiote « idéal » n'a pas été défini : la plupart des liens avec l'obésité, l'humeur ou les maladies sont des associations, dont la causalité est encore étudiée.",
      ] },
      { h: 'Probiotiques', body: [
        "Définition consensuelle (FAO/OMS 2001, ISAPP 2014) : « micro-organismes vivants qui, administrés en quantités adéquates, apportent un bénéfice pour la santé de l'hôte ». Un produit qui contient des bactéries n'est donc pas forcément un probiotique : il faut une souche identifiée, une dose et un bénéfice démontré.",
        "Les effets dépendent de la souche (genre, espèce et souche, comme Lactobacillus rhamnosus GG) et ne se généralisent pas. Les preuves les plus solides concernent la prévention de la diarrhée liée aux antibiotiques et certaines diarrhées infectieuses de l'enfant. Pour la plupart des autres usages, les résultats sont modestes ou inconstants. La plupart des souches ne s'installent pas durablement : elles transitent.",
        "En Europe, l'EFSA n'a validé aucune allégation santé générique pour les probiotiques. La seule autorisée concerne les ferments vivants du yaourt, qui améliorent la digestion du lactose.",
      ] },
      { h: 'Prébiotiques', body: [
        "Définition ISAPP (2017) : « substrat utilisé sélectivement par les micro-organismes de l'hôte, apportant un bénéfice pour la santé ». Les mieux étudiés sont l'inuline et les fructo-oligosaccharides (chicorée, artichaut, poireau, oignon, ail, banane peu mûre) et les galacto-oligosaccharides (légumineuses). Ils favorisent notamment les bifidobactéries.",
      ] },
      { h: 'Aliments fermentés', body: [
        "Yaourt, kéfir, choucroute crue, kimchi, miso, kombucha contiennent des micro-organismes vivants, mais rarement des souches et doses validées comme probiotiques. Un essai contrôlé (Wastyk, Cell 2021) a montré qu'une alimentation riche en aliments fermentés augmentait la diversité du microbiote et diminuait plusieurs marqueurs d'inflammation en 10 semaines.",
      ] },
    ],
    sources: [S.hill, S.gibson, S.wastyk, S.sender],
  },
  {
    id: 'sel',
    title: 'Sel et sodium',
    summary: 'Rôle du sodium, lien avec la tension artérielle, et où se cache le sel.',
    facts: [
      ['Repère OMS', 'moins de 5 g de sel/jour'],
      ['Conversion', '1 g de sodium = 2,5 g de sel'],
      ['Consommation moyenne en France', 'environ 7 à 9 g/jour'],
    ],
    sections: [
      { h: 'Rôle', body: [
        "Le sodium est le principal ion à l'extérieur des cellules. Avec le potassium, à l'intérieur, il maintient le volume des liquides du corps et le potentiel électrique des membranes, indispensable aux nerfs et aux muscles. Le rein ajuste très finement son excrétion.",
      ] },
      { h: 'Sel et tension', body: [
        "Un excès de sodium fait retenir de l'eau et augmente la pression artérielle, de façon plus marquée chez les personnes hypertendues, âgées ou sensibles au sel. Réduire le sel baisse la tension en quelques semaines. Le potassium (fruits, légumes, légumineuses) a l'effet inverse.",
      ] },
      { h: 'Où il se cache', body: [
        "Environ 75 % du sel consommé vient des aliments transformés, pas de la salière : pain (premier contributeur en France), charcuterie, fromages, plats préparés, sauces, biscuits apéritifs. Sur l'étiquette, la ligne « Sel » a remplacé « Sodium » ; l'app l'affiche en grammes de sel.",
      ] },
    ],
    sources: [S.who, S.anses],
  },
  {
    id: 'micronutriments',
    title: 'Vitamines et minéraux',
    summary: 'Les micronutriments les plus souvent insuffisants, et ce qui aide ou gêne leur absorption.',
    facts: [
      ['Vitamines liposolubles', 'A, D, E, K'],
      ['Vitamines hydrosolubles', 'C et groupe B'],
      ['Fer héminique absorbé', '15 à 35 %'],
      ['Fer non héminique absorbé', '2 à 20 %'],
    ],
    sections: [
      { h: 'Deux familles de vitamines', body: [
        "Les vitamines liposolubles (A, D, E, K) sont absorbées avec les graisses et stockées dans le foie et le tissu adipeux : un excès prolongé, surtout en compléments (A, D), peut être toxique. Les hydrosolubles (C et B) sont peu stockées, sauf la B12, et l'excès est éliminé dans les urines.",
      ] },
      { h: 'Les points de vigilance', body: [
        [
          "Vitamine D : synthétisée par la peau sous les UVB. Une grande partie de la population française est en dessous des seuils recommandés en fin d'hiver. Sources alimentaires : poissons gras, jaune d'œuf, aliments enrichis.",
          "Vitamine B12 : présente uniquement dans les produits animaux. Une alimentation végétalienne impose une supplémentation. Les réserves du foie durent plusieurs années, donc une carence s'installe lentement.",
          "Fer : le fer héminique (viande, poisson) est bien absorbé. Le fer non héminique (légumineuses, céréales, épinards) l'est beaucoup moins. La vitamine C du même repas multiplie son absorption ; les phytates (céréales complètes, légumineuses, réduits par le trempage), les polyphénols du thé et du café et le calcium la freinent.",
          'Calcium : produits laitiers, eaux minérales calciques, choux, amandes, tofu au calcium. Son absorption dépend de la vitamine D.',
          "Iode : nécessaire aux hormones thyroïdiennes. Sources : produits de la mer, produits laitiers, sel iodé.",
          'Folates (B9) : légumes verts, légumineuses. Essentiels avant et en début de grossesse, pour le développement du tube neural.',
        ],
      ] },
      { h: 'Compléments', body: [
        "Hors carence avérée, situation particulière (grossesse, végétalisme, personne âgée) ou avis médical, une alimentation variée couvre les besoins. Les essais de supplémentation chez des personnes sans carence montrent rarement un bénéfice.",
      ] },
    ],
    sources: [S.anses, S.efsaDrv],
  },
]

export const sheet = id => SHEETS.find(s => s.id === id)
