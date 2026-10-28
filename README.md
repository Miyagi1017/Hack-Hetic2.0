# Odyssée — Planificateur de voyage intelligent

Projet HETIC. Application web de planification de voyage : itinéraire jour par jour sur carte, budget adaptatif, suggestions d'activités locales et réservations.

## Fonctionnalités

- **Planificateur** : carte interactive persistante, étapes par jour, conflits horaires, programme aléatoire (jour ou séjour complet).
- **Budget** : enveloppe de 0 à 100 000 €, curseur + profils (Essentiel, Équilibré, Confort, Signature), répartition hébergement / repas / activités / transport, diagnostic du rythme et optimisation.
- **Sélecteur d'activités** : activités connues à proximité triées par distance, rayon ajustable, filtrage par enveloppe budgétaire (« Mon budget », « Gratuit », « Tout ») et par centres d'intérêt, ajustement du budget directement dans la fenêtre avec bouton **Appliquer le budget**.
- **Profil** : connexion simulée, édition du nom, de l'avatar, du style de voyage et des centres d'intérêt, mémorisés par utilisateur.
- **Dates & voyageurs** : dates, durée (1 à 21 jours) et nombre de voyageurs éditables depuis le planificateur, l'onglet Explorer ou le budget, avec adaptation automatique de l'enveloppe.
- **Explorer** : recommandations par ville, filtre « Mes envies » basé sur le profil, budget maximum.
- **Comparateur de prix** : offres multi-prestataires, promotions, options gratuites et liens externes.
- **Règles locales** : restrictions, traditions et festivals par ville/pays, avec alerte dans le planificateur.
- **Envies, spots photo, réservations** : listes et fiches dédiées.

## Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS
- lucide-react
- Données de démonstration locales (aucun backend requis)

Les préférences, le budget et les dates sont persistés dans le `localStorage` du navigateur (clés `odyssee:*`).

## Démarrer

```bash
npm install
npm run dev
```

L'application est servie par défaut sur `http://localhost:3000` (port modifiable via `PORT`). Le serveur Express sert l'app Vite et l'endpoint du concierge IA ; sans clé `GEMINI_API_KEY`, l'assistant bascule sur des réponses locales de démonstration.

Optionnel : copiez `.env.example` vers `.env` et renseignez `GEMINI_API_KEY` pour activer le concierge IA.

## Build de production

```bash
npm run build
npx vite preview --port 3200
```

## Structure

```
src/
  components/   vues et fenêtres (planificateur, budget, explorer, profil…)
  data/         données de démonstration et logique métier (budget, dates, intérêts, règles locales)
  types/        types TypeScript du voyage
```

## Compte de démonstration

Depuis l'écran de connexion, le bouton **Démo** ouvre le profil d'Evan (Rome, 3 jours, 2 voyageurs).
