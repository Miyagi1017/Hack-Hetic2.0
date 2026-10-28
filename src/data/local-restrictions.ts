import { DestinationRestriction } from '../types/travel';

/* ------------------------------------------------------------------
   Règles & restrictions par ville
   Les voyages Rome et Paris embarquent déjà leurs données ; ce fichier
   complète Tokyo, Barcelone et un jeu générique pour les autres choix.
   ------------------------------------------------------------------ */

const TOKYO_RESTRICTIONS: DestinationRestriction[] = [
  {
    id: 'tokyo-1',
    title: 'Passeport valide & formulaire Visit Japan Web',
    category: 'formalité',
    status: 'obligatoire',
    description:
      'Passeport valide requis. Le formulaire d’entrée et la déclaration douanière se remplissent en ligne avant l’arrivée.',
    details:
      'Créez votre QR code Visit Japan Web dans les 48 h précédant le vol. Les ressortissants français peuvent séjourner 90 jours sans visa touristique.',
    source: 'Ambassade du Japon en France',
    lastUpdated: '2026-10-10',
  },
  {
    id: 'tokyo-2',
    title: 'Interdiction de fumer dans la rue',
    category: 'écologie',
    status: 'obligatoire',
    description:
      'Fumer en marchant est interdit dans la plupart des arrondissements de Tokyo, avec amendes à la clé.',
    details:
      'Des zones fumeurs sont prévues près des gares et dans certains cafés. Le tri des déchets est strict : rapportez vos détritus.',
    source: 'Tokyo Metropolitan Government',
    lastUpdated: '2026-09-28',
  },
  {
    id: 'tokyo-3',
    title: 'Taxe de séjour municipale',
    category: 'taxe',
    status: 'obligatoire',
    description:
      'Une taxe d’hébergement est due par nuit et par personne pour les hôtels et ryokans.',
    details:
      'Environ 100 à 200 ¥ par nuit selon le tarif de la chambre ; souvent réglée directement à l’hôtel.',
    source: 'Tokyo Metropolitan Government',
    lastUpdated: '2026-08-30',
  },
  {
    id: 'tokyo-4',
    title: 'Carte de transport Suica / Pasmo',
    category: 'formalité',
    status: 'recommandé',
    description:
      'Une carte IC rechargeable simplifie tous les trajets en métro, train et bus de la capitale.',
    details:
      'Ajoutez la carte Suica à votre téléphone ou achetez-la en gare. Le JR Pass n’est pas nécessaire pour un séjour limité à Tokyo.',
    source: 'JR East',
    lastUpdated: '2026-10-02',
  },
  {
    id: 'tokyo-5',
    title: 'Pharmacies & urgences',
    category: 'santé',
    status: 'info',
    description:
      'Aucun vaccin obligatoire. Le 119 joint les secours, le 110 la police.',
    details:
      'Certains médicaments courants (pseudoéphédrine) sont interdits : emportez votre ordonnance et vérifiez la réglementation douanière.',
    source: 'Ministère de la Santé du Japon',
    lastUpdated: '2026-07-18',
  },
];

const BARCELONA_RESTRICTIONS: DestinationRestriction[] = [
  {
    id: 'bcn-1',
    title: 'Taxe touristique de Catalogne',
    category: 'taxe',
    status: 'obligatoire',
    description:
      'Taxe régionale et taxe municipale applicables par nuit et par personne, à régler à l’hébergement.',
    details:
      'Comptez environ 3,50 € à 7 € par nuit selon la catégorie de l’établissement. Les moins de 16 ans en sont exonérés.',
    source: 'Generalitat de Catalunya',
    lastUpdated: '2026-09-12',
  },
  {
    id: 'bcn-2',
    title: 'Zone à basses émissions (ZBE Rondes)',
    category: 'écologie',
    status: 'obligatoire',
    description:
      'Les véhicules les plus polluants ne peuvent pas circuler dans la zone métropolitaine en semaine.',
    details:
      'Si vous louez une voiture, vérifiez l’éco-vignette DGT. Le métro et la marche couvrent très bien le centre touristique.',
    source: 'Ajuntament de Barcelona',
    lastUpdated: '2026-10-05',
  },
  {
    id: 'bcn-3',
    title: 'Règles d’usage des plages',
    category: 'formalité',
    status: 'recommandé',
    description:
      'La vente ambulante et les activités commerciales sont encadrées sur les plages urbaines.',
    details:
      'Baignez-vous dans les zones surveillées, ne laissez pas vos affaires sans surveillance et respectez les douches et zones de repos.',
    source: 'Ajuntament de Barcelona',
    lastUpdated: '2026-08-21',
  },
  {
    id: 'bcn-4',
    title: 'Réservation des sites Gaudí',
    category: 'formalité',
    status: 'recommandé',
    description:
      'Sagrada Família, Park Güell et Casa Batlló se visitent sur créneau horodaté.',
    details:
      'Réservez plusieurs jours à l’avance, surtout le week-end. Les premiers créneaux du matin sont les plus calmes.',
    source: 'Basílica de la Sagrada Família',
    lastUpdated: '2026-10-01',
  },
];

const GENERIC_RESTRICTIONS: DestinationRestriction[] = [
  {
    id: 'generic-1',
    title: 'Documents de voyage valides',
    category: 'formalité',
    status: 'obligatoire',
    description:
      'Vérifiez la validité de votre passeport ou carte d’identité et les conditions d’entrée du pays.',
    details:
      'Consultez les conseils aux voyageurs du ministère des Affaires étrangères avant le départ et gardez une copie numérique de vos documents.',
    source: 'Ministère des Affaires Étrangères',
    lastUpdated: '2026-10-15',
  },
  {
    id: 'generic-2',
    title: 'Taxe de séjour locale',
    category: 'taxe',
    status: 'obligatoire',
    description:
      'De nombreuses villes appliquent une taxe par nuit et par personne, payable sur place.',
    details:
      'Le montant varie selon la catégorie de l’hébergement. Il est souvent indiqué dans les conditions de réservation.',
    source: 'Office de tourisme local',
    lastUpdated: '2026-09-30',
  },
  {
    id: 'generic-3',
    title: 'Assurance voyage recommandée',
    category: 'santé',
    status: 'recommandé',
    description:
      'Une couverture santé et rapatriement évite des frais importants en cas d’imprévu.',
    details:
      'Vérifiez que votre carte bancaire inclut l’assurance et conservez les numéros d’urgence avec vous.',
    source: 'Service public',
    lastUpdated: '2026-06-20',
  },
];

const BY_CITY: Record<string, DestinationRestriction[]> = {
  tokyo: TOKYO_RESTRICTIONS,
  barcelone: BARCELONA_RESTRICTIONS,
  barcelona: BARCELONA_RESTRICTIONS,
  default: GENERIC_RESTRICTIONS,
};

export const getCityRestrictions = (city: string): DestinationRestriction[] => {
  const key = city.trim().toLowerCase().split(',')[0];
  return BY_CITY[key] ?? BY_CITY.default;
};
