import { CityFestival, CityTradition } from '../types/travel';

/* ------------------------------------------------------------------
   Us & coutumes locales + calendrier festif
   Chaque ville reçoit ses règles de savoir-vivre, ses coutumes et les
   festivités de la période. Le contenu sert d’alerte avant le départ.
   ------------------------------------------------------------------ */

const TRADITIONS: Record<string, CityTradition[]> = {
  rome: [
    {
      id: 'rome-cafe',
      title: 'Le café se boit debout, en une gorgée',
      category: 'coutume',
      description:
        'À Rome, le cappuccino est un petit-déjeuner et non une boisson d’après-repas. Au comptoir (al banco), le prix est souvent deux fois moindre qu’en terrasse.',
      doTip: 'Commandez « un caffè » au comptoir entre deux visites.',
      dontTip: 'Évitez le cappuccino après 11 h ou pendant un repas.',
    },
    {
      id: 'rome-eglise',
      title: 'Tenue correcte dans les lieux de culte',
      category: 'étiquette',
      description:
        'Épaules et genoux couverts sont exigés à Saint-Pierre, au Panthéon et dans la plupart des basiliques romaines.',
      doTip: 'Gardez un foulard ou une écharpe légère dans votre sac.',
      dontTip: 'Pas de débardeur, de short court ni de chapeau à l’intérieur.',
    },
    {
      id: 'rome-fontaine',
      title: 'L’eau des fontaines est potable',
      category: 'coutume',
      description:
        'Les « nasoni » (fontaines publiques) distribuent une eau fraîche et gratuite. Les Romains y remplissent leur gourde.',
      doTip: 'Emportez une gourde réutilisable et remplissez-la en chemin.',
      dontTip: 'Ne vous baignez pas et ne pique-niquez pas sur le rebord des fontaines.',
    },
    {
      id: 'rome-aperitivo',
      title: 'L’apéritif romain, un rituel social',
      category: 'coutume',
      description:
        'Entre 18 h 30 et 20 h, les bars de Trastevere ou du Testaccio servent un spritz accompagné de petites bouchées.',
      doTip: 'Trinquez avec un « cin cin » et goûtez les supplì.',
      dontTip: 'Le pourboire n’est pas obligatoire : le « coperto » est déjà sur l’addition.',
    },
    {
      id: 'rome-baignade',
      title: 'Baignade interdite dans les fontaines monumentales',
      category: 'sécurité',
      description:
        'Se baigner ou s’asseoir dans la fontaine de Trevi est passible d’une amende de plusieurs centaines d’euros.',
      doTip: 'Jetez une pièce avec la main droite par-dessus l’épaule gauche.',
      dontTip: 'Ne touchez pas aux sculptures et ne laissez aucun déchet.',
    },
  ],
  paris: [
    {
      id: 'paris-bonjour',
      title: 'Dire « bonjour » avant toute demande',
      category: 'étiquette',
      description:
        'Entrer dans une boutique, demander son chemin ou commander sans saluer est perçu comme impoli à Paris.',
      doTip: '« Bonjour » puis « s’il vous plaît » : la formule ouvre toutes les portes.',
      dontTip: 'Évitez le tutoiement avec un commerçant que vous ne connaissez pas.',
    },
    {
      id: 'paris-terrasse',
      title: 'La terrasse se choisit, le service se règle',
      category: 'coutume',
      description:
        'Le prix d’un café varie selon la position : comptoir, salle ou terrasse. Le service est inclus dans l’addition.',
      doTip: 'Asseyez-vous face à la rue pour profiter du spectacle parisien.',
      dontTip: 'Pas besoin d’ajouter 15 % : un arrondi de 1 à 2 € suffit.',
    },
    {
      id: 'paris-metro',
      title: 'Priorité aux sortants dans le métro',
      category: 'étiquette',
      description:
        'On laisse descendre avant de monter, on cède la place aux personnes âgées et on baisse le son de son téléphone.',
      doTip: 'Validez votre titre à chaque correspondance et gardez-le jusqu’à la sortie.',
      dontTip: 'Évitez de bloquer les escalators ou les portes automatiques.',
    },
    {
      id: 'paris-musee',
      title: 'Réservation horodatée dans les grands musées',
      category: 'coutume',
      description:
        'Le Louvre, Orsay et Sainte-Chapelle demandent un créneau réservé. Les premier dimanche du mois sont souvent gratuits mais bondés.',
      doTip: 'Privilégiez une entrée à l’ouverture ou après 16 h.',
      dontTip: 'Ne photographiez pas avec flash dans les salles d’exposition.',
    },
    {
      id: 'paris-pickpocket',
      title: 'Vigilance dans les zones touristiques',
      category: 'sécurité',
      description:
        'Les abords de la tour Eiffel, du Sacré-Cœur et les lignes 1 et 4 concentrent les pickpockets et les « pétitions » frauduleuses.',
      doTip: 'Sac fermé devant vous, téléphone rangé dans les transports.',
      dontTip: 'Ne signez rien et ne donnez pas d’argent à un inconnu dans la rue.',
    },
  ],
  barcelone: [
    {
      id: 'barcelone-horaires',
      title: 'Repas décalés et sieste',
      category: 'coutume',
      description:
        'Le déjeuner se prend entre 14 h et 15 h 30, le dîner à partir de 21 h. Beaucoup de commerces ferment entre 14 h et 17 h.',
      doTip: 'Calez vos visites le matin et réservez les restaurants tard.',
      dontTip: 'Ne comptez pas sur un déjeuner à 12 h en dehors des zones touristiques.',
    },
    {
      id: 'barcelone-panellets',
      title: 'La culture des « panellets » et du vermouth',
      category: 'coutume',
      description:
        'Le dimanche midi, le vermouth (« el vermut ») se partage entre amis avec olives et anchois. En novembre, les panellets célèbrent la Castanyada.',
      doTip: 'Goûtez un vermut de la casa dans un bar de Gràcia.',
      dontTip: 'Ne refusez pas la tournée : c’est un geste de convivialité.',
    },
    {
      id: 'barcelone-gaudi',
      title: 'Respect des espaces Gaudí',
      category: 'étiquette',
      description:
        'La Sagrada Família et le Park Güell exigent un billet horodaté. Les pelouses et les sculptures ne sont pas des aires de jeu.',
      doTip: 'Réservez la Sagrada Família en ligne plusieurs jours à l’avance.',
      dontTip: 'Pas de pique-nique sur les mosaïques du Park Güell.',
    },
    {
      id: 'barcelone-plage',
      title: 'Plages urbaines réglementées',
      category: 'sécurité',
      description:
        'La baignade est interdite hors zones surveillées et la vente ambulante est réglementée sur la Barceloneta.',
      doTip: 'Surveillez vos affaires et baignez-vous près des postes de secours.',
      dontTip: 'Ne laissez pas vos objets sans surveillance sur le sable.',
    },
  ],
  tokyo: [
    {
      id: 'tokyo-silence',
      title: 'Silence dans les transports',
      category: 'étiquette',
      description:
        'On ne téléphone pas dans le métro, on met son téléphone en mode silencieux et on évite de manger dans les rames.',
      doTip: 'Préparez votre trajet et votre carte Suica avant d’entrer.',
      dontTip: 'Ne parlez pas fort et ne bloquez pas les portes.',
    },
    {
      id: 'tokyo-shoes',
      title: 'On se déchausse à l’intérieur',
      category: 'coutume',
      description:
        'Ryokan, temples, certains restaurants et maisons exigent de retirer ses chaussures. Des chaussons sont fournis.',
      doTip: 'Portez des chaussettes propres et des chaussures faciles à retirer.',
      dontTip: 'Ne marchez pas en chaussons sur les tatamis des pièces privées.',
    },
    {
      id: 'tokyo-bol',
      title: 'Aspirer les nouilles est poli',
      category: 'coutume',
      description:
        'Slurper les ramen refroidit le plat et montre votre appréciation. On ne plante pas les baguettes dans le riz.',
      doTip: 'Dites « itadakimasu » avant de manger et « gochisōsama » après.',
      dontTip: 'Ne passez pas de nourriture de baguette à baguette.',
    },
    {
      id: 'tokyo-dechets',
      title: 'Pas de poubelles dans la rue',
      category: 'coutume',
      description:
        'Les déchets sont rapportés chez soi ou déposés dans les konbini. Le tri est très strict.',
      doTip: 'Emportez un petit sac pour vos déchets de la journée.',
      dontTip: 'Ne laissez rien derrière vous dans les sanctuaires.',
    },
  ],
  default: [
    {
      id: 'default-salut',
      title: 'Saluer et demander avant de photographier',
      category: 'étiquette',
      description:
        'Un sourire et un « bonjour » local ouvrent les portes. Demandez toujours l’accord avant de photographier une personne.',
      doTip: 'Apprenez deux mots de la langue locale : ils font toujours plaisir.',
      dontTip: 'Ne photographiez pas les lieux de culte pendant les offices.',
    },
    {
      id: 'default-pourboire',
      title: 'Pourboire : vérifiez s’il est inclus',
      category: 'coutume',
      description:
        'Selon les pays, le service est inclus ou non. Un petit arrondi reste apprécié sans être obligatoire.',
      doTip: 'Consultez l’addition : « service compris » signifie qu’il n’y a rien à ajouter.',
      dontTip: 'Ne laissez pas de pourboire en pièces sur le comptoir d’un pays où cela peut offenser.',
    },
    {
      id: 'default-securite',
      title: 'Gardez une copie de vos documents',
      category: 'sécurité',
      description:
        'Une photo de votre passeport et de votre assurance voyage dans le cloud évite bien des complications.',
      doTip: 'Enregistrez le numéro de l’ambassade et le 112 (urgence en Europe).',
      dontTip: 'Ne laissez jamais vos bagages sans surveillance dans un lieu public.',
    },
  ],
};

const FESTIVALS: Record<string, CityFestival[]> = {
  rome: [
    {
      id: 'rome-estate',
      name: 'Estate Romana',
      period: 'juin → septembre',
      description:
        'Cinéma en plein air, concerts et visites nocturnes dans les villas et places de Rome.',
      isFree: true,
    },
    {
      id: 'rome-filmfest',
      name: 'Rome Film Fest',
      period: 'mi-octobre',
      description: 'Avant-premières, rencontres avec les réalisateurs et projections à l’Auditorium.',
      isFree: false,
      priceFrom: 9,
    },
    {
      id: 'rome-noel',
      name: 'Marché de Noël de la Piazza Navona',
      period: 'décembre',
      description: 'Stands de santons, sucreries et calèches illuminées sur la place baroque.',
      isFree: true,
    },
    {
      id: 'rome-repubblica',
      name: 'Festa della Repubblica',
      period: '2 juin',
      description: 'Défilé militaire et survol des Frecce Tricolori au-dessus du Vittoriano.',
      isFree: true,
    },
  ],
  paris: [
    {
      id: 'paris-musique',
      name: 'Fête de la Musique',
      period: '21 juin',
      description: 'Concerts gratuits à chaque coin de rue, dans les cours et les jardins.',
      isFree: true,
    },
    {
      id: 'paris-patrimoine',
      name: 'Journées européennes du Patrimoine',
      period: '3e week-end de septembre',
      description: 'Ouverture exceptionnelle de lieux institutionnels et visites guidées gratuites.',
      isFree: true,
    },
    {
      id: 'paris-nuitblanche',
      name: 'Nuit Blanche',
      period: 'début octobre',
      description: 'Parcours d’art contemporain nocturne à travers la ville.',
      isFree: true,
    },
    {
      id: 'paris-noel',
      name: 'Marché de Noël des Tuileries',
      period: 'fin novembre → décembre',
      description: 'Chalets, vin chaud et grande roue au cœur du jardin des Tuileries.',
      isFree: true,
    },
  ],
  barcelone: [
    {
      id: 'barcelona-gracia',
      name: 'Festa Major de Gràcia',
      period: 'mi-août',
      description: 'Rues décorées par les habitants, concerts et repas de quartier.',
      isFree: true,
    },
    {
      id: 'barcelona-merce',
      name: 'La Mercè',
      period: '24 septembre',
      description: 'Castellers, correfocs et géants défilent pour la fête de la ville.',
      isFree: true,
    },
    {
      id: 'barcelona-castanyada',
      name: 'La Castanyada',
      period: '1er novembre',
      description: 'Châtaignes grillées, panellets et boniatos sur les étals de rue.',
      isFree: true,
    },
  ],
  tokyo: [
    {
      id: 'tokyo-hanami',
      name: 'Hanami',
      period: 'fin mars → début avril',
      description: 'Pique-niques sous les cerisiers en fleurs dans les parcs de la ville.',
      isFree: true,
    },
    {
      id: 'tokyo-hanabi',
      name: 'Feux d’artifice d’été',
      period: 'juillet → août',
      description: 'Soirées pyrotechniques au bord de la Sumida, en yukata.',
      isFree: false,
      priceFrom: 11,
    },
    {
      id: 'tokyo-matsuri',
      name: 'Matsuri de quartier',
      period: 'tout au long de l’année',
      description: 'Processions de mikoshi, stands de nourriture et tambours taiko.',
      isFree: true,
    },
  ],
  default: [
    {
      id: 'default-marche',
      name: 'Marché nocturne local',
      period: 'selon la saison',
      description: 'Artisans, cuisine de rue et musique live au cœur de la ville.',
      isFree: true,
    },
    {
      id: 'default-fete',
      name: 'Fête nationale',
      period: 'date nationale',
      description: 'Défilés, spectacles et animations gratuites dans les rues.',
      isFree: true,
    },
  ],
};

const key = (city: string): string => city.trim().toLowerCase().split(',')[0];

export const getCityTraditions = (city: string): CityTradition[] =>
  TRADITIONS[key(city)] ?? TRADITIONS.default;

export const getCityFestivals = (city: string): CityFestival[] =>
  FESTIVALS[key(city)] ?? FESTIVALS.default;
