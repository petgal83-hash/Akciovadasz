
export enum Store {
  TESCO = "Tesco",
  AUCHAN = "Auchan",
  LIDL = "Lidl",
  ALDI = "Aldi",
  SPAR = "Spar",
  PENNY = "Penny",
}

export interface Product {
  id: string;
  name: string;
  store: Store;
  category: string;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  validUntil: string; // YYYY-MM-DD
  imageUrl: string;
  unit: string; // e.g., 'kg', 'l', 'db'
}

export interface AdPlaceholder {
  id: string;
  isAd: true;
}

export type ProductOrAd = Product | AdPlaceholder;
