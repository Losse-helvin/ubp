# Template Emailing — Solutions AGV & AMR (Ubepro)

Template HTML d'emailing conçu pour promouvoir la landing page **[https://www.ubepro.fr/solutions-agv-amr](https://www.ubepro.fr/solutions-agv-amr)** en reprenant sa charte graphique officielle (`#28a0c8`, `#004a9e`, `#164194`, `#0f2a33`, `#f4f6fb`, `#deeeff`, typographie *Poppins* avec pile système de secours).

## Fichier livré

- `index.html` : Template HTML autonome prêt à importer dans **Mailjet** (ou tout routeur emailing B2B : Brevo, HubSpot, ActiveCampaign…).

## Paramètres de tracking & variables routeur

- **URL cible des CTA** :
  `https://www.ubepro.fr/solutions-agv-amr?ltm_source=EMAIL#nom`
  *(Vous pouvez compléter avec `&ltm_category=XXX&utm_campaign=agv_amr` selon la nomenclature de votre campagne CRM/HelloLead.)*
- **Variables Mailjet incluses** (conformes au modèle existant `template-mailjet`) :
  - Lien miroir : `https://[[PERMALINK]]`
  - Lien de désinscription : `https://[[UNSUB_LINK_FR]]`
- **Visuels hébergés en HTTPS absolu sur `www.ubepro.fr`** :
  - Logo : `https://www.ubepro.fr/solutions-agv-amr/img/674fff79418f54ebd2611b02_Ubepro-2-bleu-logo-vf-p-500.png`
  - Visuel Hero AGV (sans filigrane) : `https://www.ubepro.fr/solutions-agv-amr/img/machine-transport-palette-p-800.jpg`
  - Puce validation : `https://www.ubepro.fr/solutions-agv-amr/img/jaccepte_2.png`

## Suggestions d'objets & preheader

- **Objet 1** : Automatisez vos flux internes : jusqu'à -40 % sur vos temps de transport
- **Objet 2** : Solutions AGV & AMR : quel ROI pour votre site logistique ou industriel ?
- **Objet 3** : Manutention interne : évaluez gratuitement vos gains potentiels (AGV / AMR)
- **Preheader intégré** : *-40 % de temps de transport interne, +35 % de productivité, ROI moyen de 18 mois : évaluez gratuitement le potentiel AGV & AMR de votre site.*

## Compatibilité clients mail

- Architecture **100 % tableaux HTML (`role="presentation"`)** largeur `600px` centrée + **CSS inline**.
- Bouton CTA **bulletproof VML (`<v:roundrect>`)** pour un rendu arrondi et cliquable sur toute la largeur dans **Microsoft Outlook Desktop (Windows)**.
- **Responsive mobile** (`@media only screen and (max-width: 620px)` et `480px`) : adaptation des marges et empilement fluide des 4 cartes d'indicateurs sur smartphone.
