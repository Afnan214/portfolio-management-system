export interface StockDirectoryEntry {
  id: number;
  companyName: string;
}

// Mirrors backend seed data from pms_server/src/main/resources/data.sql until the
// watchlist API returns stock symbols alongside stock ids.
export const STOCK_DIRECTORY: Readonly<Record<string, StockDirectoryEntry>> = {
  AAPL: { id: 1, companyName: 'Apple Inc.' },
  MSFT: { id: 2, companyName: 'Microsoft Corp.' },
  GOOGL: { id: 3, companyName: 'Alphabet Inc. Cl A' },
  AMZN: { id: 4, companyName: 'Amazon.com Inc.' },
  NVDA: { id: 5, companyName: 'NVIDIA Corp.' },
  META: { id: 6, companyName: 'Meta Platforms Inc.' },
  TSLA: { id: 7, companyName: 'Tesla Inc.' },
  'BRK.B': { id: 8, companyName: 'Berkshire Hathaway Inc. Cl B' },
  JPM: { id: 9, companyName: 'JPMorgan Chase & Co.' },
  V: { id: 10, companyName: 'Visa Inc. Cl A' },
  UNH: { id: 11, companyName: 'UnitedHealth Group Inc.' },
  XOM: { id: 12, companyName: 'Exxon Mobil Corp.' },
  MA: { id: 13, companyName: 'Mastercard Inc.' },
  JNJ: { id: 14, companyName: 'Johnson & Johnson' },
  PG: { id: 15, companyName: 'Procter & Gamble Co.' },
  HD: { id: 16, companyName: 'Home Depot Inc.' },
  COST: { id: 17, companyName: 'Costco Wholesale Corp.' },
  ABBV: { id: 18, companyName: 'AbbVie Inc.' },
  CRM: { id: 19, companyName: 'Salesforce Inc.' },
  BAC: { id: 20, companyName: 'Bank of America Corp.' },
  AVGO: { id: 21, companyName: 'Broadcom Inc.' },
  KO: { id: 22, companyName: 'Coca-Cola Co.' },
  WMT: { id: 23, companyName: 'Walmart Inc.' },
  PEP: { id: 24, companyName: 'PepsiCo Inc.' },
  MRK: { id: 25, companyName: 'Merck & Co. Inc.' },
  LLY: { id: 26, companyName: 'Eli Lilly & Co.' },
  TMO: { id: 27, companyName: 'Thermo Fisher Scientific Inc.' },
  CSCO: { id: 28, companyName: 'Cisco Systems Inc.' },
  ADBE: { id: 29, companyName: 'Adobe Inc.' },
  NFLX: { id: 30, companyName: 'Netflix Inc.' },
};

export const STOCK_SYMBOL_BY_ID: Readonly<Record<number, string>> = Object.freeze(
  Object.fromEntries(
    Object.entries(STOCK_DIRECTORY).map(([symbol, entry]) => [entry.id, symbol]),
  ) as Record<number, string>,
);
