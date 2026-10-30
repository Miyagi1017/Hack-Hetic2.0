import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Coins, Info, Wallet } from 'lucide-react';
import {
  CURRENCIES,
  RATES_UPDATED,
  convertAmount,
  formatMoney,
  formatRate,
  getCurrency,
  getLocalCurrency,
} from '../data/currency';

interface CurrencyConverterProps {
  destination: string;
  country?: string;
  budgetTotal: number;
  travelers?: number;
  totalCalculated?: number;
}

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

const parseAmount = (value: string): number => {
  const cleaned = value.replace(/\s/g, '').replace(',', '.');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Convertisseur euro ↔ devise locale : montants libres, sélection des devises
 * et équivalent du budget du séjour sur place.
 */
export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  destination,
  country,
  budgetTotal,
  travelers = 1,
  totalCalculated,
}) => {
  const local = useMemo(() => getLocalCurrency(destination, country), [destination, country]);
  const [from, setFrom] = useState('EUR');
  const [to, setTo] = useState(local.code);
  const [side, setSide] = useState<'from' | 'to'>('from');
  const [fromAmount, setFromAmount] = useState('100');
  const [toAmount, setToAmount] = useState('');

  useEffect(() => {
    setTo(local.code);
    setFrom('EUR');
    setSide('from');
    setFromAmount('100');
    setToAmount('');
  }, [local.code]);

  const fromCurrency = getCurrency(from);
  const toCurrency = getCurrency(to);

  const converted = useMemo(() => {
    if (side === 'from') {
      return convertAmount(parseAmount(fromAmount), from, to);
    }
    return convertAmount(parseAmount(toAmount), to, from);
  }, [side, fromAmount, toAmount, from, to]);

  const displayValue = (value: number, code: string): string => {
    const currency = getCurrency(code);
    const rounded = currency.noDecimals ? Math.round(value) : Math.round(value * 100) / 100;
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: currency.noDecimals ? 0 : 2,
    }).format(rounded);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
    setFromAmount(displayValue(converted, side === 'from' ? to : from).replace(/\s/g, ''));
    setSide('from');
    setToAmount('');
  };

  const budgetLocal = convertAmount(budgetTotal, 'EUR', local.code);
  const perTravelerLocal = convertAmount(budgetTotal / Math.max(1, travelers), 'EUR', local.code);
  const remainingLocal =
    totalCalculated != null ? convertAmount(totalCalculated, 'EUR', local.code) : null;

  return (
    <div className="rounded-[26px] border border-line bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
            <Coins className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-xl font-semibold text-ink">Convertisseur — devise locale</h3>
            <p className="mt-0.5 text-[13px] text-muted">
              Sur place, à {destination.split(',')[0]}, on paie en{' '}
              <strong className="font-semibold text-ink-soft">
                {local.name} ({local.code})
              </strong>
              .
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-muted">
          <Wallet className="h-3 w-3" />
          {formatRate(local.code)}
        </span>
      </div>

      <div className="mt-4 grid items-end gap-2.5 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
            Montant
          </label>
          <div className="flex items-stretch gap-1.5">
            <input
              type="text"
              inputMode="decimal"
              value={side === 'to' ? displayValue(converted, from) : fromAmount}
              onChange={(event) => {
                setSide('from');
                setFromAmount(event.target.value);
              }}
              aria-label={`Montant en ${fromCurrency.name}`}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm font-semibold text-ink focus:border-ink focus:outline-none"
            />
            <select
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              aria-label="Devise de départ"
              className="w-[8.5rem] shrink-0 rounded-xl border border-line bg-paper px-2 py-2.5 text-xs font-semibold text-ink focus:border-ink focus:outline-none"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} {currency.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={swap}
          aria-label="Inverser les devises"
          title="Inverser les devises"
          className="mx-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
            Équivalent
          </label>
          <div className="flex items-stretch gap-1.5">
            <input
              type="text"
              inputMode="decimal"
              value={side === 'from' ? displayValue(converted, to) : toAmount}
              onChange={(event) => {
                setSide('to');
                setToAmount(event.target.value);
              }}
              aria-label={`Montant en ${toCurrency.name}`}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm font-semibold text-ink focus:border-ink focus:outline-none"
            />
            <select
              value={to}
              onChange={(event) => setTo(event.target.value)}
              aria-label="Devise d'arrivée"
              className="w-[8.5rem] shrink-0 rounded-xl border border-line bg-paper px-2 py-2.5 text-xs font-semibold text-ink focus:border-ink focus:outline-none"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} {currency.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Rapide</span>
        {QUICK_AMOUNTS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setSide('from');
              setFromAmount(String(value));
            }}
            className="cursor-pointer rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {value} {fromCurrency.symbol}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setSide('from');
            setFromAmount(String(budgetTotal));
          }}
          className="cursor-pointer rounded-full border border-accent bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
        >
          Budget · {formatMoney(budgetTotal, 'EUR')}
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-paper px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Budget du séjour
          </p>
          <p className="mt-1 flex flex-wrap items-baseline gap-1.5">
            <span className="font-serif text-lg font-semibold text-ink">
              ≈ {formatMoney(budgetLocal, local.code)}
            </span>
            <span className="text-[11px] text-muted">({formatMoney(budgetTotal, 'EUR')})</span>
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-paper px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Par voyageur
          </p>
          <p className="mt-1 flex flex-wrap items-baseline gap-1.5">
            <span className="font-serif text-lg font-semibold text-ink">
              ≈ {formatMoney(perTravelerLocal, local.code)}
            </span>
            <span className="text-[11px] text-muted">
              ({formatMoney(budgetTotal / Math.max(1, travelers), 'EUR')}) · {travelers} pers.
            </span>
          </p>
        </div>
      </div>

      {remainingLocal != null && (
        <p className="mt-2 text-[11px] text-muted">
          Dépenses estimées sur place : {formatMoney(remainingLocal, local.code)} (
          {formatMoney(totalCalculated ?? 0, 'EUR')}).
        </p>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-muted">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        Taux indicatifs du {RATES_UPDATED}, hors frais bancaires et commissions de change.
        {local.code !== 'EUR' && (
          <>
            {' '}
            Pensez à prévenir votre banque et à comparer le change sur place : les bureaux
            d'aéroport sont souvent les plus chers.
          </>
        )}
      </p>
    </div>
  );
};
