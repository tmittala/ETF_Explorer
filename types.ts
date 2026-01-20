
export interface Holding {
  name: string;
  percentage: string;
}

export interface Alternative {
  ticker: string;
  price: string;
}

export interface ETFData {
  ticker: string;
  summary: string;
  sector: string;
  currentPrice: string;
  performance: {
    ytd: string;
    threeMonth: string;
    sixMonth: string;
    oneYear: string;
  };
  holdings: Holding[];
  alternatives: Alternative[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type ImageSize = '1K' | '2K' | '4K';
