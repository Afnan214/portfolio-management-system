export interface StockMeta {
  industry: string;
  sector: string;
}

export const STOCK_META: Record<string, StockMeta> = {
  AAPL:    { sector: 'Technology',         industry: 'Consumer Electronics' },
  MSFT:    { sector: 'Technology',         industry: 'Software' },
  GOOGL:   { sector: 'Technology',         industry: 'Internet Services' },
  AMZN:    { sector: 'Consumer Cyclical',  industry: 'E-Commerce' },
  NVDA:    { sector: 'Technology',         industry: 'Semiconductors' },
  META:    { sector: 'Technology',         industry: 'Social Media' },
  TSLA:    { sector: 'Consumer Cyclical',  industry: 'Auto Manufacturers' },
  'BRK.B': { sector: 'Financial Services', industry: 'Insurance' },
  JPM:     { sector: 'Financial Services', industry: 'Banking' },
  V:       { sector: 'Financial Services', industry: 'Credit Services' },
  UNH:     { sector: 'Healthcare',         industry: 'Health Insurance' },
  XOM:     { sector: 'Energy',             industry: 'Oil & Gas' },
  MA:      { sector: 'Financial Services', industry: 'Credit Services' },
  JNJ:     { sector: 'Healthcare',         industry: 'Pharmaceuticals' },
  PG:      { sector: 'Consumer Defensive', industry: 'Household Products' },
  HD:      { sector: 'Consumer Cyclical',  industry: 'Home Improvement' },
  COST:    { sector: 'Consumer Defensive', industry: 'Retail' },
  ABBV:    { sector: 'Healthcare',         industry: 'Biotechnology' },
  CRM:     { sector: 'Technology',         industry: 'Software' },
  BAC:     { sector: 'Financial Services', industry: 'Banking' },
  AVGO:    { sector: 'Technology',         industry: 'Semiconductors' },
  KO:      { sector: 'Consumer Defensive', industry: 'Beverages' },
  WMT:     { sector: 'Consumer Defensive', industry: 'Retail' },
  PEP:     { sector: 'Consumer Defensive', industry: 'Beverages' },
  MRK:     { sector: 'Healthcare',         industry: 'Pharmaceuticals' },
  LLY:     { sector: 'Healthcare',         industry: 'Pharmaceuticals' },
  TMO:     { sector: 'Healthcare',         industry: 'Medical Instruments' },
  CSCO:    { sector: 'Technology',         industry: 'Networking' },
  ADBE:    { sector: 'Technology',         industry: 'Software' },
  NFLX:    { sector: 'Technology',         industry: 'Entertainment' },
};
