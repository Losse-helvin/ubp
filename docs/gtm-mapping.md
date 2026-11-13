# GTM — mapping par groupe, conteneur et `form_id`

> Audit **et correction** du 2026-11-13 — branche `arena/61f8be71-ubp`, puis contrôle de conformité à la consigne d'installation Google (snippet `GTM-53SH7D7F` + push `formulaire_lead`) — branche `arena/f9bbd9c4-ubp`.
> Périmètre : 174 pages HTML du repo (`*/index.html`), réparties dans les 3 groupes de la liste de référence.
> Les `form_id` de la colonne « observé à l'exécution » sont **relevés en exécutant réellement le JS de chaque page** (JSDOM, lecture du `dataLayer`), pas déduits du source.

## Ce qui a été corrigé

| # | Correction | Pages |
|---|---|---|
| 1 | Convention GTM Google standardisée : commentaires `<!-- Google Tag Manager -->` / `<!-- End Google Tag Manager -->`, snippet en `<head>`, `<noscript>` juste après `<body>` (hors `<div class="w-embed w-iframe">`) | 114 |
| 2 | Suppression des `<noscript>` GTM en double (risque de double comptage) : `courtier-energies-industries`, `energie`, `securite`, `securite-rcs`, `securite-telesurveillance`, `fuso/panneaux-photovoltaiques`, `remerciements-assurances-collectives` | 7 |
| 3 | Retrait du conteneur `GTM-53SH7D7F` des pages devant être « sans GTM » (groupe 3) | 26 |
| 4 | **Groupe 3 : suppression de tout le balisage Google restant** — `gtag.js G-3XPBT7BZ10`, bloc `Consent Mode V2` (`gtag('consent','default',…)`), `gtag('config',…)`, pushes `dataLayer` (`cookie_preferences_updated`, `formulaire_lead` legacy) et `gtag('consent','update')`. **Meta Pixel conservé.** | 81 pages HTML + 137 fichiers JS |
| 5 | **Snippet `GTM-53SH7D7F` remonté en tête de `<head>`** (il était le dernier script, après GA4 et Meta Pixel) pour respecter la consigne « collez ce code le plus haut possible dans le `<head>` ». Il ne reste au-dessus que le `meta charset`, le script Webflow anti-FOUC et le Consent Mode V2 (qui doit précéder tout tag Google). | 27 |
| 6 | **`bar-business-canalplus`** : le champ « Raison sociale » s'appelait `name="nom"`, en doublon avec le champ « Nom » → la société partait **vide** dans le lead et dans le CRM. Renommé `name="societe"` (id `societe`). Vérifié : `societe` désormais transmis. | 1 |

Contrôles automatisés après correction :

- **Structure GTM** (HTML, 174/174) : 1 seul `gtm.js`, 1 seul `<noscript>`, conteneur unique conforme au groupe, `Consent Mode` avant GTM, aucun conteneur GTM en groupe 3.
- **Exécution** (JSDOM) : `gtm.js` poussé une seule fois par page en G1 et G2 ; **0** `dataLayer` créé sur les 86 pages du groupe 3 ; **0** erreur JS sur ces 86 pages.
- **Formulaires** : `formulaire_lead` + `form_id` sur **60/61** pages du G1 (`typ-categories` et `typ-categories-hd` sont des pages d'iframe sans `<form>` : exemptées) et **27/27** du G2.

## Notes de lecture

- **`form_id` transmis** : valeur réellement poussée dans `dataLayer` à la soumission (`event: "formulaire_lead"`, clé `form_id`).
- **Identifiant du `<form>` (DOM)** : attribut `id` du `<form>` dans le HTML (ou `name` quand il n'y a pas d'`id`) — souvent un UUID Webflow. Il ne doit **pas** servir d'identifiant CRM : seul le `formId` du `lead-handler.js` fait foi quand il existe.
- Les 11 pages du G1 **sans `lead-handler.js`** utilisent le handler inline de `script.js`, qui envoie `form.id || form.name || document.title` : leur `form_id` est donc l'`id` (ou à défaut le `name`) Webflow. **Ces identifiants restent à enregistrer côté CRM** (liste dédiée plus bas).
- `—` : page sans formulaire de lead (remerciements, blog, 404, templates, pages iframe…).

## Groupe 1. `GTM-WMVZJKS` — 61 pages

Conteneur GTM présent et unique ; GA4 direct `G-3XPBT7BZ10` conservé (hors périmètre GTM).

| # | Page | `form_id` transmis | Origine | Identifiant du `<form>` (DOM) |
|---|---|---|---|---|
| 1 | `assurance-tns-pro/index.html` | `a24732423448454o` | lead-handler.js | `wf-form-Tns-pr-voyance` |
| 2 | `avantages-salaries/index.html` | `a62723309826377s` | lead-handler.js | `wf-form-Avantages-Salari-s` |
| 3 | `bar-business-canalplus/index.html` | `b11223803679298s` | lead-handler.js | `wf-form-` |
| 4 | `business-password-manager/index.html` | `wf-form-NordPass_Form` | id DOM | `wf-form-NordPass_Form` |
| 5 | `cartes-cadeaux-noel/index.html` | `c65433496459474l` | lead-handler.js | `wf-form-carte-cadeaux-noel` |
| 6 | `cartes-et-cheques-cadeaux-salaries-kadeos/index.html` | `c91922764331972s` | lead-handler.js | `wf-form-Kadeos_Noel_Form` |
| 7 | `celebrez-le-noel-des-salaries-avec-kadeos/index.html` | `c34247768993691s` | lead-handler.js | `wf-form-edenred_sous_la-rentree` |
| 8 | `commerce/index.html` | `c97152881341839e` | lead-handler.js | `wf-form-energie-commerce-form` |
| 9 | `comparer-caisse-enregistreuse-commerce-2025/index.html` | `c53902760189785e` | lead-handler.js | `wf-form-Caisse-Form` |
| 10 | `comparer-caisse-enregistreuse-commerce-2025-v2/index.html` | `wf-form-Caisse-Form` | id DOM | `wf-form-Caisse-Form` |
| 11 | `devis-securite/index.html` | `d34186271460238e` | lead-handler.js | `wf-form-devis-securite-fev-form` |
| 12 | `ds-automobiles-gamme-pallas-business/index.html` | `wf-form-DS-Pallas-Form` | id DOM | `wf-form-DS-Pallas-Form` |
| 13 | `ds-automobiles-nouvelle-gamme-pallas/index.html` | `d75191516173766s` | lead-handler.js | `wf-form-DS-Pallas-Form` |
| 14 | `ds-automobiles-nouvelle-gamme-pallas-v1/index.html` | `d77498286594717v` | lead-handler.js | `wf-form-DS-Pallas-Form` |
| 15 | `ecomobility/index.html` | `e83202657572937y` | lead-handler.js | `wf-form-ecomobility-1` |
| 16 | `ecomobility-construction/index.html` | `e92286790207443n` | lead-handler.js | `wf-form-ecomobility-construction-fev` |
| 17 | `ecomobility-geolocalisation/index.html` | `e98444450889367n` | lead-handler.js | `wf-form-ecomobility-2025` |
| 18 | `ecomobility-transport/index.html` | `e95435577255846t` | lead-handler.js | `wf-form-ecomobility-transport-fev` |
| 19 | `edenred-la-nouvelle-ere-du-ticket-restaurant/index.html` | `e61353420378402t` | lead-handler.js | `wf-form-TR_form-Avril_2025` |
| 20 | `edf-solutions/index.html` | `e58637208913628s` | lead-handler.js | `wf-form-EDF-Solution-Solaire` |
| 21 | `edf-solutions-solaires-professionnels/index.html` | `e19312227173937s` | lead-handler.js | `wf-form-edf-solution-solaire-pro` |
| 22 | `energie-commerce-bouche/index.html` | `e25931297974474e` | lead-handler.js | `wf-form-energie-boulangerie-form` |
| 23 | `energie-industrie/index.html` | `e56236745250875e` | lead-handler.js | `wf-form-energie-form-industrie` |
| 24 | `energie-pros/index.html` | `e74288201888626s` | lead-handler.js | `wf-form-energie-pros-form` |
| 25 | `energie-service/index.html` | `e38169290488741e` | lead-handler.js | `wf-form-energie-service-form` |
| 26 | `energie-v2/index.html` | `wf-form-energie-form` | id DOM | `wf-form-energie-form` |
| 27 | `exploitation-agricole/index.html` | `e57156379155146e` | lead-handler.js | `wf-form-energie-form` |
| 28 | `fiat-pro/index.html` | `f97921226554480o` | lead-handler.js | `wf-form-Fiat-Pro-Form` |
| 29 | `financez-les-repas-de-vos-salaries-en-etant-exonere-a-100/index.html` | `f61047575435331a` | lead-handler.js | `wf-form-TR_form-Mars_2025` |
| 30 | `form-energie/index.html` | `f47282440914802e` | lead-handler.js | `wf-form-energie-form-janv-new` |
| 31 | `fuso/kiwatch/index.html` | `k37606740724627h` | lead-handler.js | `wf-form-kiwatch-form` |
| 32 | `fuso/methanisation-agricole/index.html` | `m29852009925210e` | lead-handler.js | `wf-form-Grdf` |
| 33 | `fuso/nettoyage-locaux-professionnels/index.html` | `n36788069989202s` | lead-handler.js | `email-form` |
| 34 | `fuso/nordpass-business/index.html` | `n34885746245527s` | lead-handler.js | `wf-form-NordPass-business-Form-2` |
| 35 | `fuso/panneaux-photovoltaiques-passez-a-l-energie-solaire/index.html` | `p21535040168169e` | lead-handler.js | `wf-form-panneaux-passer-a-l-energie` |
| 36 | `fuso/panneaux-photovoltaiques-passez-a-lenergie-solaire-v2/index.html` | `p98359722802562v` | lead-handler.js | `wf-form-panneaux-passer-a-l-energie` |
| 37 | `fuso/recrutement/index.html` | `r22636563896239t` | lead-handler.js | `wf-form-Recrutement-form` |
| 38 | `recrutement-industrie-btp-hotellerie-restauration/index.html` | `r15164250983242n` | lead-handler.js | `wf-form-Recrutement-btp-industrie-form` |
| 39 | `remerciements-cartes-cadeaux/index.html` | `r17973121525840x` | lead-handler.js | `wf-form-carte_cadeau_formulaire_typ` |
| 40 | `remerciements-geolocalisation/index.html` | `r81170925649143n` | lead-handler.js | `wf-form-typ-G-olocalisation-de-flotte-ubepro-janv` |
| 41 | `remerciements-panneaux-solaire-2/index.html` | `r77178725455583e` | lead-handler.js | `wf-form-solaire-form-typ` |
| 42 | `remerciements-panneaux-solaires/index.html` | `r26771867448929s` | lead-handler.js | `wf-form-solaire-form-typ` |
| 43 | `remerciements-ticket-restaurant/index.html` | `r15064704681587t` | lead-handler.js | `wf-form-titre-restaurant_form_typ` |
| 44 | `securite-pro/index.html` | `s81632982416370o` | lead-handler.js | `wf-form-Securite_Form_ubepro` |
| 45 | `securite-pro-v4/index.html` | `wf-form-Securite_Form_TRA` | id DOM | `wf-form-Securite_Form_TRA` |
| 46 | `securite-telephone/index.html` | `s37742789514085e` | lead-handler.js | `wf-form-securite-ubepro-form` |
| 47 | `securite-v2/index.html` | `s57964631774614v` | lead-handler.js | `wf-form-securite-ubepro-form` |
| 48 | `smart-electricite/index.html` | `s34253611620262e` | lead-handler.js | `wf-form-Smart-electricite-form` |
| 49 | `sms-fiat-pro/index.html` | `wf-form-Fiat-Pro-Form` | name DOM | `wf-form-Fiat-Pro-Form` |
| 50 | `still-manutention/index.html` | `s68092043088940n` | lead-handler.js | `wf-form-Still-Manutention-Form` |
| 51 | `still-manutention-v2/index.html` | `wf-form-Still-Manutention-sms` | id DOM | `wf-form-Still-Manutention-sms` |
| 52 | `still-manutention-v4/index.html` | `wf-form-Still-Manutention-673303a4c4a630813484e1d1` | id DOM | `wf-form-Still-Manutention-673303a4c4a630813484e1d1` |
| 53 | `ticket-restaurant/index.html` | `t49695179026769t` | lead-handler.js | `wf-form-edenred_formulaire_ticket` |
| 54 | `ticket-restaurant-black-friday/index.html` | `t59903896525233y` | lead-handler.js | `wf-form-Ticket_Restaurant-Black-Friday` |
| 55 | `ticket-restaurant-commencez-l-annee-sans-frais/index.html` | `t87094481709835s` | lead-handler.js | `wf-form-TR_form-Janvier_2025` |
| 56 | `ticket-restaurant-la-solution-defiscalisee-qui-regale-tout-le-monde/index.html` | `t14988108447649e` | lead-handler.js | `wf-form-TR_form-Avril_2025` |
| 57 | `tout-schuss-sur-la-carte-ticket-restaurant/index.html` | `t39040218569845t` | lead-handler.js | `wf-form-TR_form-Fevrier_2025` |
| 58 | `typ-categories/index.html` | `—` | — | `—` |
| 59 | `typ-categories-hd/index.html` | `—` | — | `—` |
| 60 | `vehicules-utilitaires/index.html` | `v78585910487629s` | lead-handler.js | `wf-form-v-hicules-utilitaires-form-ubepro` |
| 61 | `vehicules-utilitaires-v2/index.html` | `wf-form-v-hicules-utilitaires-form-ubepro` | id DOM | `wf-form-v-hicules-utilitaires-form-ubepro` |

## Groupe 2. `GTM-53SH7D7F` — 27 pages

Conteneur GTM présent et unique, **conforme à la consigne d'installation Google fournie** :

- snippet `GTM-53SH7D7F` **copié à l'identique** (aucune modification du code entre `<script>` et `</script>`), encadré par `<!-- Google Tag Manager -->` / `<!-- End Google Tag Manager -->` ;
- placé **le plus haut possible dans le `<head>`** : déplacé avant le tag GA4 (`gtag.js`), il n'est plus précédé que par le `<meta charset>` et le script Webflow `w-mod-js` (indispensable aux styles) — et par le bloc **Consent Mode V2**, qui doit légalement le précéder ;
- `<noscript>` `ns.html?id=GTM-53SH7D7F` collé **immédiatement après `<body>`**, dans ses commentaires d'encadrement ;
- `dataLayer.push({ event: "formulaire_lead" })` déclenché **à la validation du formulaire** sur les 27 pages (vérifié à l'exécution) — avec en plus `form_id`, `lead_source` et `categorie`, exigés par le conteneur.

Vérifications automatisées : 27/27 pages chargent bien `gtm.js?id=GTM-53SH7D7F` une seule fois (contrôle à l'exécution, pas seulement dans le source), et poussent `formulaire_lead` avec un `form_id`.

| # | Page | `form_id` transmis | Origine | Identifiant du `<form>` (DOM) |
|---|---|---|---|---|
| 1 | `actiflip-rayonnage/index.html` | `a26284124165053e` | lead-handler.js | `wf-form-actiflip-formly` |
| 2 | `citroen/index.html` | `c26611810218480n` | lead-handler.js | `email-form` |
| 3 | `courtier-energies-industries/index.html` | `c69294502156634s` | lead-handler.js | `wf-form-Smart-electricite-form` |
| 4 | `destockage-fuso-ecanter/index.html` | `d14311667893295r` | lead-handler.js | `wf-form-Fuso-Form` |
| 5 | `diagnostic-accessibilite-erp/index.html` | `d14168883897522p` | lead-handler.js | `wf-form-Email-Form-erp` |
| 6 | `energie/index.html` | `e68565765887757e` | lead-handler.js | `wf-form-energie-form` |
| 7 | `erp-diagnostic/index.html` | `email-form` | id DOM | `email-form` |
| 8 | `formation-bureautique/index.html` | `f12319323324594e` | lead-handler.js | `wf-form-Formation-bureautique` |
| 9 | `formation-management-pme/index.html` | `f24627122205040e` | lead-handler.js | `email-form` |
| 10 | `formation-wordpress/index.html` | `f97518008983079s` | lead-handler.js | `wf-form-Formation-Wordpress` |
| 11 | `fuso-ecanter/index.html` | `f54642796399133r` | lead-handler.js | `wf-form-Fuso-Form` |
| 12 | `fuso/lexus-lbx/index.html` | `email-form` | id DOM | `email-form` |
| 13 | `fuso/manutention-robotisee-rocla-agv-solutions/index.html` | `m53654912908065s` | lead-handler.js | `email-form` |
| 14 | `fuso/mitsubishi-motors/index.html` | `m71830015006689s` | lead-handler.js | `email-form` |
| 15 | `fuso/panneaux-photovoltaiques/index.html` | `p94439826936532s` | lead-handler.js | `wf-form-Panneaux-photovolta-ques-ubepro-form` |
| 16 | `fuso/recrutement-cadres-dirigeants/index.html` | `r13946845575256s` | lead-handler.js | `email-form` |
| 17 | `recrutement-commerciaux/index.html` | `r53174942339972x` | lead-handler.js | `email-form` |
| 18 | `recrutement-fonctions-marketing/index.html` | `r25608730721417g` | lead-handler.js | `email-form` |
| 19 | `recrutement-it-tech/index.html` | `r47559938790788h` | lead-handler.js | `email-form` |
| 20 | `remerciements-assurances-collectives/index.html` | `r95272247123195s` | lead-handler.js | `wf-form-Assurance-Collective-Typ` |
| 21 | `securite/index.html` | `s67026492357686e` | lead-handler.js | `wf-form-securite-ubepro-form` |
| 22 | `securite-rcs/index.html` | `wf-form-securite-ubepro-form` | id DOM | `wf-form-securite-ubepro-form` |
| 23 | `securite-telesurveillance/index.html` | `wf-form-securite-ubepro-form` | id DOM | `wf-form-securite-ubepro-form` |
| 24 | `solutions-agv/index.html` | `s90121568882660v` | lead-handler.js | `email-form` |
| 25 | `solutions-agv-amr/index.html` | `s59878679548441r` | lead-handler.js | `wf-form-Email-Form-AGV` |
| 26 | `solutions-agv-amr-v2/index.html` | `s39978766862812v` | lead-handler.js | `email-form` |
| 27 | `telesurveillance/index.html` | `t48295113109172e` | lead-handler.js | `wf-form-Securite_Form-2` |

## Groupe 3. Sans GTM — 86 pages

Aucun conteneur GTM, **et plus aucun balisage Google** (gtag/GA4, Consent Mode, `dataLayer`) après la correction n°4. Le Meta Pixel reste en place là où il était.

| # | Page | `form_id` transmis | Origine | Identifiant du `<form>` (DOM) |
|---|---|---|---|---|
| 1 | `401/index.html` | `email-form` | id DOM | `email-form` |
| 2 | `404/index.html` | `—` | — | `—` |
| 3 | `about-us/index.html` | `email-form` | id DOM | `email-form` |
| 4 | `assurances-professionnelles/index.html` | `a81400294243322s` | lead-handler.js | `wf-form-Assurance-Form` |
| 5 | `audi-typ/index.html` | `—` | — | `—` |
| 6 | `blog/index.html` | `—` | — | `—` |
| 7 | `checkout/index.html` | `—` | — | `—` |
| 8 | `compara/index.html` | `—` | — | `—` |
| 9 | `contact-us/index.html` | `—` | — | `—` |
| 10 | `detail_blog-posts/index.html` | `—` | — | `—` |
| 11 | `detail_category/index.html` | `—` | — | `—` |
| 12 | `detail_posts-categories/index.html` | `—` | — | `—` |
| 13 | `detail_product/index.html` | `—` | — | `—` |
| 14 | `detail_sku/index.html` | `—` | — | `—` |
| 15 | `devispro-solaire/index.html` | `d34004765687650e` | lead-handler.js | `email-form` |
| 16 | `ds-automobiles-business-days/index.html` | `d12299068644470s` | lead-handler.js | `wf-form-DS-Automobiles-business` |
| 17 | `ds-automobiles-business-v2/index.html` | `wf-form-DS_Automobiles_SMS` | id DOM | `wf-form-DS_Automobiles_SMS` |
| 18 | `ds-automobiles-v2/index.html` | `wf-form-Ds-Automobiles-Form` | id DOM | `wf-form-Ds-Automobiles-Form` |
| 19 | `ds-business-days/index.html` | `d44042674135116s` | lead-handler.js | `wf-form-DS-Automobiles-business` |
| 20 | `edenred-kadeos/index.html` | `e90896560446402s` | lead-handler.js | `wf-form-ticket-kadeos-septembre-form-ubepro` |
| 21 | `faq/index.html` | `—` | — | `—` |
| 22 | `fiat-politique-de-confidentialite/index.html` | `—` | — | `—` |
| 23 | `form-securite/index.html` | `f37328246714414e` | lead-handler.js | `form_securite` |
| 24 | `formulaire/index.html` | `email-form` | id DOM | `email-form` |
| 25 | `formulaire-calendly/index.html` | `f78399509234054y` | lead-handler.js | `email-form` |
| 26 | `formulaires-audi/formulaire-audi-a1/index.html` | `email-form` | id DOM | `email-form` |
| 27 | `formulaires-audi/formulaire-audi-a2/index.html` | `email-form` | id DOM | `email-form` |
| 28 | `formulaires-audi/formulaire-audi-a3/index.html` | `email-form` | id DOM | `email-form` |
| 29 | `formulaires-audi/formulaire-audi-a5/index.html` | `email-form` | id DOM | `email-form` |
| 30 | `formulaires-audi/formulaire-audi-q3/index.html` | `email-form` | id DOM | `email-form` |
| 31 | `formulaires-audi/formulaire-audi-q4/index.html` | `email-form` | id DOM | `email-form` |
| 32 | `formulaires-audi/formulaire-audi-q5/index.html` | `email-form` | id DOM | `email-form` |
| 33 | `formulaires-audi/formulaire-audi-q6/index.html` | `email-form` | id DOM | `email-form` |
| 34 | `formulaires-typ/formulaire-caisses/index.html` | `f73796509413865s` | lead-handler.js | `wf-form-Caisse-Form` |
| 35 | `formulaires-typ/formulaire-energie/index.html` | `f96666432081076e` | lead-handler.js | `wf-form-energie-form` |
| 36 | `formulaires-typ/formulaire-leads/index.html` | `f58579263439088s` | lead-handler.js | `email-form` |
| 37 | `formulaires-typ/formulaire-manutention/index.html` | `wf-form-Still-Manutention-673303a4c4a630813484e1d1` | id DOM | `wf-form-Still-Manutention-673303a4c4a630813484e1d1` |
| 38 | `formulaires-typ/formulaire-panneaux/index.html` | `f85378296874920x` | lead-handler.js | `wf-form-panneaux-passer-a-l-energie` |
| 39 | `formulaires-typ/formulaire-rayonnage/index.html` | `wf-form-Actiflip-TRA-UbePro` | id DOM | `wf-form-Actiflip-TRA-UbePro` |
| 40 | `formulaires-typ/formulaire-sage/index.html` | `wf-form-Sage-Form-TRA` | id DOM | `wf-form-Sage-Form-TRA` |
| 41 | `formulaires-typ/formulaire-securite/index.html` | `f19412491167982e` | lead-handler.js | `wf-form-securite-ubepro-form` |
| 42 | `formulaires-typ/formulaire-vehicules/index.html` | `f16952589797203v` | lead-handler.js | `wf-form-v-hicules-utilitaires-form-ubepro` |
| 43 | `fuso/index.html` | `f10610605258043o` | lead-handler.js | `wf-form-Fuso-Form` |
| 44 | `fuso-v2/index.html` | `f65678019302010v` | lead-handler.js | `wf-form-Fuso-Form` |
| 45 | `fuso/gamme-de-rayonnage-actiflip-hd/index.html` | `g78706384677425d` | lead-handler.js | `wf-form-actiflip-formly` |
| 46 | `fuso/gamme-de-rayonnage-actiflip-v4/index.html` | `wf-form-Actiflip-TRA-UbePro` | id DOM | `wf-form-Actiflip-TRA-UbePro` |
| 47 | `fuso/hellolead-test/index.html` | `—` | — | `—` |
| 48 | `fuso/home-2/index.html` | `—` | — | `—` |
| 49 | `fuso/home-3/index.html` | `—` | — | `—` |
| 50 | `fuso/lp-fiat-pro-rentree-fiat-professional/index.html` | `—` | — | `—` |
| 51 | `fuso/mentions-legales/index.html` | `—` | — | `—` |
| 52 | `fuso/mitsubishi-motors-v2/index.html` | `email-form` | id DOM | `email-form` |
| 53 | `fuso/nouvelle-experience-business-canalplus/index.html` | `email-form` | id DOM | `email-form` |
| 54 | `fuso/old-home/index.html` | `—` | — | `—` |
| 55 | `fuso/order-confirmation/index.html` | `—` | — | `—` |
| 56 | `fuso/our-team/index.html` | `email-form` | id DOM | `email-form` |
| 57 | `fuso/paypal-checkout/index.html` | `—` | — | `—` |
| 58 | `fuso/photovoltaique-auvergne-rhone-alpes/index.html` | `wf-form-monabee-form` | id DOM | `wf-form-monabee-form` |
| 59 | `fuso/politique-de-confidentialite-donnees-personnelles/index.html` | `—` | — | `—` |
| 60 | `renault-trucks/index.html` | `r19075460881050s` | lead-handler.js | `email-form` |
| 61 | `renault-trucks-v2/index.html` | `email-form` | id DOM | `email-form` |
| 62 | `rothelec/index.html` | `r97758357557143c` | lead-handler.js | `wf-form-Rothelec_form` |
| 63 | `sage-gestion-de-la-paie-v4/index.html` | `wf-form-Sage-Form-TRA` | id DOM | `wf-form-Sage-Form-TRA` |
| 64 | `search/index.html` | `—` | — | `—` |
| 65 | `securite-devis/index.html` | `s50234510689579s` | lead-handler.js | `wf-form-securite-janv-form` |
| 66 | `services/index.html` | `—` | — | `—` |
| 67 | `shop/index.html` | `—` | — | `—` |
| 68 | `solutions-industrielles-cles/index.html` | `—` | — | `—` |
| 69 | `template-mailjet/still/index.html` | `—` | — | `—` |
| 70 | `templates/changelog/index.html` | `—` | — | `—` |
| 71 | `templates/licensing/index.html` | `—` | — | `—` |
| 72 | `templates/style-guide/index.html` | `—` | — | `—` |
| 73 | `test/index.html` | `email-form` | id DOM | `email-form` |
| 74 | `test/form-assurance/index.html` | `f77995097331414e` | lead-handler.js | `wf-form-A-iard-666c16a1cf8ee5882cbb53f0` |
| 75 | `test/form-panneaux/index.html` | `f96093882612905x` | lead-handler.js | `wf-form-Panneaux-photovolta-ques` |
| 76 | `test/formulaire/index.html` | `f80334454966322e` | lead-handler.js | `wf-form-securite-janv-form` |
| 77 | `testimonials/index.html` | `—` | — | `—` |
| 78 | `thank-you/index.html` | `—` | — | `—` |
| 79 | `ticket-restaurant-v2/index.html` | `wf-form-edenred_formulaire_ticket` | id DOM | `wf-form-edenred_formulaire_ticket` |
| 80 | `tous-les-vehicules-a-portee-de-clic/index.html` | `—` | — | `—` |
| 81 | `toyota-gamme-vehicules-professionnels/index.html` | `t77034726205448s` | lead-handler.js | `email-form` |
| 82 | `toyota-proace-max/index.html` | `t38119595756326x` | lead-handler.js | `email-form` |
| 83 | `typ-ds-automobiles/index.html` | `—` | — | `—` |
| 84 | `une-rentree-sous-le-signe-du-pouvoir-dachat/index.html` | `u87149338686229t` | lead-handler.js | `wf-form-edenred_sous_la-rentree` |
| 85 | `vehicules-de-societe/index.html` | `a13749586307084i` | lead-handler.js | `wf-form-voiture-professionnel-form-ubepro` |
| 86 | `verisure/index.html` | `—` | — | `—` |

### `form_id` à enregistrer côté CRM (pages sans `lead-handler.js`)

| Groupe | Page | `form_id` transmis aujourd'hui |
|---|---|---|
| 1 | `business-password-manager/index.html` | `wf-form-NordPass_Form` |
| 1 | `comparer-caisse-enregistreuse-commerce-2025-v2/index.html` | `wf-form-Caisse-Form` |
| 1 | `ds-automobiles-gamme-pallas-business/index.html` | `wf-form-DS-Pallas-Form` |
| 1 | `energie-v2/index.html` | `wf-form-energie-form` |
| 1 | `securite-pro-v4/index.html` | `wf-form-Securite_Form_TRA` |
| 1 | `sms-fiat-pro/index.html` | `wf-form-Fiat-Pro-Form` |
| 1 | `still-manutention-v2/index.html` | `wf-form-Still-Manutention-sms` |
| 1 | `still-manutention-v4/index.html` | `wf-form-Still-Manutention-673303a4c4a630813484e1d1` |
| 1 | `vehicules-utilitaires-v2/index.html` | `wf-form-v-hicules-utilitaires-form-ubepro` |
| 2 | `erp-diagnostic/index.html` | `email-form` |
| 2 | `fuso/lexus-lbx/index.html` | `email-form` |
| 2 | `securite-rcs/index.html` | `wf-form-securite-ubepro-form` |
| 2 | `securite-telesurveillance/index.html` | `wf-form-securite-ubepro-form` |

### Hors listes de référence

| Page | Conteneur actuel | Remarque |
|---|---|---|
| `accueil/index.html` | aucun | uniquement GA4 `G-3XPBT7BZ10` (page non listée, laissée inchangée) |
| `agv_amr/index.html` | `GTM-53SH7D7F` | page non listée, laissée inchangée |
| `template-email-agv-amr/index.html` | aucun | template email |
| `test/form-assurance.html`, `test/form-panneaux.html`, `test/formulaire.html` | aucun | fichiers HTML racine (les dossiers `test/form-*/` sont en groupe 3) |
