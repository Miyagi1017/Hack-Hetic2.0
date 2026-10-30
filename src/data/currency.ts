export interface Currency {
  code: string;
  name: string;
  symbol: string;
  /** Nombre d'unités pour 1 € (taux indicatif). */
  perEur: number;
  /** Devises sans centimes (Yen, Won, Rupiah…). */
  noDecimals?: boolean;
}

/**
 * Taux indicatifs (base 1 €) — mis à jour manuellement, sans appel réseau :
 * le prototype fonctionne entièrement hors ligne.
 */
export const RATES_UPDATED = '29 octobre 2026';

export const CURRENCIES: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', perEur: 1 },
  { code: 'USD', name: 'Dollar américain', symbol: '$', perEur: 1.08 },
  { code: 'GBP', name: 'Livre sterling', symbol: '£', perEur: 0.84 },
  { code: 'JPY', name: 'Yen japonais', symbol: '¥', perEur: 168, noDecimals: true },
  { code: 'CHF', name: 'Franc suisse', symbol: 'CHF', perEur: 0.94 },
  { code: 'MAD', name: 'Dirham marocain', symbol: 'DH', perEur: 10.8 },
  { code: 'CAD', name: 'Dollar canadien', symbol: 'CA$', perEur: 1.47 },
  { code: 'AUD', name: 'Dollar australien', symbol: 'A$', perEur: 1.66 },
  { code: 'CNY', name: 'Yuan chinois', symbol: '¥', perEur: 7.8 },
  { code: 'THB', name: 'Baht thaïlandais', symbol: '฿', perEur: 37.5 },
  { code: 'TRY', name: 'Livre turque', symbol: '₺', perEur: 38 },
  { code: 'MXN', name: 'Peso mexicain', symbol: 'MX$', perEur: 19.8 },
  { code: 'BRL', name: 'Réal brésilien', symbol: 'R$', perEur: 5.9 },
  { code: 'AED', name: 'Dirham des Émirats', symbol: 'AED', perEur: 3.97 },
  { code: 'INR', name: 'Roupie indienne', symbol: '₹', perEur: 91 },
  { code: 'KRW', name: 'Won sud-coréen', symbol: '₩', perEur: 1460, noDecimals: true },
  { code: 'IDR', name: 'Roupie indonésienne', symbol: 'Rp', perEur: 17200, noDecimals: true },
  { code: 'VND', name: 'Dong vietnamien', symbol: '₫', perEur: 27400, noDecimals: true },
  { code: 'SGD', name: 'Dollar de Singapour', symbol: 'S$', perEur: 1.45 },
  { code: 'HKD', name: 'Dollar de Hong Kong', symbol: 'HK$', perEur: 8.4 },
  { code: 'NZD', name: 'Dollar néo-zélandais', symbol: 'NZ$', perEur: 1.8 },
  { code: 'SEK', name: 'Couronne suédoise', symbol: 'kr', perEur: 11.4 },
  { code: 'NOK', name: 'Couronne norvégienne', symbol: 'kr', perEur: 11.7 },
  { code: 'DKK', name: 'Couronne danoise', symbol: 'kr', perEur: 7.46 },
  { code: 'PLN', name: 'Zloty polonais', symbol: 'zł', perEur: 4.32 },
  { code: 'CZK', name: 'Couronne tchèque', symbol: 'Kč', perEur: 25.3 },
  { code: 'HUF', name: 'Forint hongrois', symbol: 'Ft', perEur: 395, noDecimals: true },
  { code: 'ZAR', name: 'Rand sud-africain', symbol: 'R', perEur: 19.9 },
  { code: 'EGP', name: 'Livre égyptienne', symbol: 'E£', perEur: 52 },
  { code: 'TND', name: 'Dinar tunisien', symbol: 'DT', perEur: 3.4 },
  { code: 'ILS', name: 'Shekel israélien', symbol: '₪', perEur: 4 },
];

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Pays / villes → devise locale (recherche sur le pays puis la destination). */
const DESTINATION_CURRENCIES: Array<{ matches: string[]; code: string }> = [
  {
    matches: [
      'italie',
      'france',
      'espagne',
      'allemagne',
      'portugal',
      'grece',
      'autriche',
      'belgique',
      'pays-bas',
      'irlande',
      'finlande',
      'estonie',
      'lettonie',
      'lituanie',
      'slovaquie',
      'slovenie',
      'luxembourg',
      'malte',
      'chypre',
      'croatie',
      'rome',
      'paris',
      'barcelone',
      'madrid',
      'lisbonne',
      'berlin',
      'amsterdam',
      'athenes',
      'vienne',
      'bruxelles',
    ],
    code: 'EUR',
  },
  { matches: ['japon', 'tokyo', 'kyoto', 'osaka'], code: 'JPY' },
  { matches: ['royaume-uni', 'angleterre', 'ecosse', 'londres', 'edimbourg'], code: 'GBP' },
  { matches: ['etats-unis', 'usa', 'new york', 'los angeles', 'san francisco'], code: 'USD' },
  { matches: ['maroc', 'marrakech', 'casablanca', 'fes'], code: 'MAD' },
  { matches: ['suisse', 'geneve', 'zurich'], code: 'CHF' },
  { matches: ['thailande', 'bangkok', 'chiang mai'], code: 'THB' },
  { matches: ['turquie', 'istanbul', 'cappadoce'], code: 'TRY' },
  { matches: ['mexique', 'mexico', 'oaxaca'], code: 'MXN' },
  { matches: ['bresil', 'rio', 'sao paulo'], code: 'BRL' },
  { matches: ['emirats', 'dubai', 'abu dhabi'], code: 'AED' },
  { matches: ['inde', 'delhi', 'mumbai', 'jaipur'], code: 'INR' },
  { matches: ['coree', 'seoul', 'busan'], code: 'KRW' },
  { matches: ['indonesie', 'bali', 'jakarta'], code: 'IDR' },
  { matches: ['vietnam', 'hanoi', 'ho chi minh'], code: 'VND' },
  { matches: ['singapour'], code: 'SGD' },
  { matches: ['hong kong'], code: 'HKD' },
  { matches: ['canada', 'montreal', 'quebec', 'vancouver'], code: 'CAD' },
  { matches: ['australie', 'sydney', 'melbourne'], code: 'AUD' },
  { matches: ['nouvelle-zelande', 'auckland'], code: 'NZD' },
  { matches: ['chine', 'pekin', 'shanghai'], code: 'CNY' },
  { matches: ['egypte', 'le caire'], code: 'EGP' },
  { matches: ['tunisie', 'tunis'], code: 'TND' },
  { matches: ['israel', 'jerusalem', 'tel aviv'], code: 'ILS' },
  { matches: ['pologne', 'varsovie', 'cracovie'], code: 'PLN' },
  { matches: ['republique tcheque', 'prague'], code: 'CZK' },
  { matches: ['hongrie', 'budapest'], code: 'HUF' },
  { matches: ['suede', 'stockholm'], code: 'SEK' },
  { matches: ['norvege', 'oslo'], code: 'NOK' },
  { matches: ['danemark', 'copenhague'], code: 'DKK' },
  { matches: ['afrique du sud', 'le cap'], code: 'ZAR' },
];

export const getCurrency = (code: string): Currency =>
  CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];

/** Devise à utiliser sur place pour une destination donnée. */
export const getLocalCurrency = (destination = '', country = ''): Currency => {
  const haystack = normalize(`${country} ${destination}`);
  const match = DESTINATION_CURRENCIES.find((entry) =>
    entry.matches.some((keyword) => haystack.includes(keyword))
  );
  return getCurrency(match?.code ?? 'EUR');
};

/** Conversion libre entre deux devises (via l'euro comme pivot). */
export const convertAmount = (amount: number, from: string, to: string): number => {
  if (!Number.isFinite(amount)) return 0;
  const fromRate = getCurrency(from).perEur;
  const toRate = getCurrency(to).perEur;
  if (!fromRate || !toRate) return 0;
  return (amount / fromRate) * toRate;
};

export const rateBetween = (from: string, to: string): number => convertAmount(1, from, to);

const roundFor = (currency: Currency, value: number): number => {
  if (currency.noDecimals) return Math.round(value);
  if (Math.abs(value) >= 100) return Math.round(value * 10) / 10;
  return Math.round(value * 100) / 100;
};

/** Formate un montant dans une devise (« 1 250 ¥ », « 45,50 € »). */
export const formatMoney = (amount: number, code: string): string => {
  const currency = getCurrency(code);
  const rounded = roundFor(currency, amount);
  const formatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: currency.noDecimals ? 0 : Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: currency.noDecimals ? 0 : 2,
  });
  return `${formatter.format(rounded)} ${currency.symbol}`;
};

/** Équivalent local d'un prix affiché en euros. */
export const localEquivalent = (amountEur: number, code: string): string =>
  formatMoney(convertAmount(amountEur, 'EUR', code), code);

/** Taux lisible : « 1 € = 168 ¥ ». */
export const formatRate = (code: string): string => {
  const currency = getCurrency(code);
  if (currency.code === 'EUR') return 'Devise du séjour : euro';
  const rate = rateBetween('EUR', code);
  const value = rate >= 100 ? Math.round(rate).toString() : rate.toFixed(rate >= 10 ? 1 : 2);
  return `1 € = ${value} ${currency.symbol}`;
};
