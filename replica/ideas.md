# Idées design / UX (2026-11-02)

Classées par rapport impact / effort pour un seul utilisateur sur Android. Effort : S = moins d'une heure,
M = une demi-journée, L = plus.

| # | Idée | Impact | Effort | Pourquoi |
|---|------|--------|--------|----------|
| 1 | **Import recette + liste de courses** (fait, voir plus bas) | fort | M | Le parcours « je vois une recette en vidéo → je l'ai dans mes plats et mes courses » n'existait pas. |
| 2 | Ajouter « Courses » au profil ou au journal (en plus de Mes plats) | moyen | S | Au magasin on ouvre l'app sur le journal ; la liste est à deux touches. |
| 3 | Regrouper les doublons de la liste (2× oignon → « oignon · 300 g ») | moyen | S | Deux recettes ajoutées le même jour donnent des lignes en double. |
| 4 | Retour haptique (`navigator.vibrate(10)`) quand on ajoute au journal ou coche un article | moyen | S | Confirmation physique sur Android, zéro octet de design en plus. Respecter l'absence de support (iOS). |
| 5 | Petites animations d'aliments dans les états vides et après un ajout (prototype fait) | moyen | S par aliment | Voir l'avis ci-dessous. |
| 6 | Minuteur par étape en mode cuisine (S14) | moyen | M | Une étape « cuire 10 min » devient un bouton. Déjà noté dans le build-log. |
| 7 | Skeletons alignés sur le contenu final (journal, détail plat) | faible | S | Moins de saut à l'affichage. |
| 8 | Import depuis un site de recettes (schema.org `Recipe` en JSON-LD) | moyen | M | Fiable et sans IA, mais demande un fetch serveur avec liste d'hôtes autorisés (pas de SSRF). |
| 9 | Graphique du poids (S18 Progrès est encore un stub) | fort | L | Gros morceau, à faire dans sa propre session. |

## Avis : animations d'aliments (pilon, œuf, avocat…)

**Oui, mais avec parcimonie.** Elles donnent de la personnalité à une app de suivi qui peut vite paraître
comptable, et un repère visuel dans les états vides. Ce qui ferait basculer dans le « pas minimaliste » :
une animation en boucle, sur chaque écran, ou qui retarde une action.

Règles proposées :
- **SVG en ligne + CSS** (keyframes `transform`/`opacity` seulement, donc GPU) : environ 1 à 2 Ko par aliment,
  zéro dépendance, couleurs tirées des tokens (`--c-text`, `--c-surface`), net à toutes les tailles.
- **Pas de Lottie** : le lecteur pèse ~60 Ko gzip pour trois icônes, et les fichiers JSON viennent souvent
  d'une banque d'illustrations dont il faudrait vérifier la licence. **Pas de GIF** : lourd, flou sur un écran
  haute densité, aucune transparence propre, et impossible à arrêter pour `prefers-reduced-motion`.
- Jouée **une seule fois** à l'apparition (≤ 1 s), jamais en boucle ; seulement dans les états vides
  (« Aucun plat », « Ta liste est vide », journal vide) et en confirmation d'un ajout.
- `prefers-reduced-motion: reduce` → image fixe (la règle globale de `ui.css` ramène déjà les durées à ~0).
- `aria-hidden="true"` : décoratives, le texte à côté porte le sens.
- Dessins originaux (formes simples, trait des icônes Lucide), aucun asset YAZIO ou MyFitnessPal.

Prototype : `src/FoodMotion.jsx` (œuf qui rebondit, pilon qui tombe, avocat qui fume), visible sur
`/?design` dans la section « Aliments animés (prototype) » avec un bouton « Rejouer ».
Validé le 2026-11-02 : pilon dans « Aucun plat pour l'instant », avocat dans « Ta liste est vide ». L'œuf reste en réserve.

## Import recette Instagram / YouTube → liste de courses (S16, S17)

Parcours : Android « Partager » sur une vidéo → Safran (manifest `share_target`, l'app doit être installée)
→ écran Importer prérempli → « Décoder la recette » → aperçu (ingrédients, quantités, étapes) →
« Créer le plat » (éditeur S15 prérempli, ingrédients rapprochés de Ciqual) ou « Ajouter à la liste de courses ».
Depuis un plat existant, un bouton ajoute ses ingrédients (recalculés selon les portions) à la liste.

Décodage : fonction Edge `import-recipe` (même garde `x-app-code` que `scan-photo`, code partagé dans
`supabase/functions/_shared/http.ts`).
- **YouTube** : la vidéo publique est donnée à Gemini par son URL (entrée vidéo YouTube officielle de l'API
  Gemini : image + son, donc aussi les recettes dites à l'oral). Vidéos privées / non répertoriées refusées.
  Aucun scraping de la page ni des sous-titres.
- **Instagram** : aucune lecture possible. L'oEmbed de Meta et l'API Graph demandent une app Meta validée
  (revue d'app) et ne donnent de toute façon pas la légende d'un reel d'un autre compte ; le scraping est
  contraire aux conditions d'Instagram et casse souvent. Donc l'utilisateur **colle la légende** ; l'écran le
  dit dès qu'un lien Instagram est saisi.
- Le serveur ne télécharge jamais l'URL fournie (pas de SSRF) : seul Gemini lit YouTube.
- Le résultat est revalidé (`parse.ts` : bornes de taille, grammes 1–5000, 40 ingrédients max…) avant
  d'arriver au client ; l'IA peut se tromper, l'éditeur demande de vérifier.

Liste de courses : **interne** (table `shopping_items` + RLS, existait déjà) plutôt qu'un export vers Google
Keep (pas d'API publique pour les comptes perso) ou Todoist (compte et jeton en plus). Avantages : synchro
entre appareils, articles cochables au magasin, rien à configurer. Le bouton « Partager la liste » envoie les
articles non cochés en texte via la feuille de partage Android (Keep, WhatsApp, SMS…), ce qui couvre l'export.
