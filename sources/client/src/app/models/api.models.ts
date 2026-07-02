// API response shapes (mirror the NestJS ManufacturerController contract).

export interface ManufacturerSummary {
  id: number;
  code: string;
  name: string;
  productCount: number;
}

export interface ManufacturersResponse {
  manufacturers: ManufacturerSummary[];
}

export interface ManufacturerRef {
  id: number;
  code: string;
  name: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  ingredients?: string | null;
  description?: string | null;
  manufacturer?: ManufacturerRef; // present in /products/search results
}

export interface ProductsResponse {
  manufacturer: ManufacturerRef;
  products: Product[];
}

export interface ProductSearchResponse {
  query: string;
  count: number;
  products: Product[];
}

// Semantic (AI) search — mirrors the NestJS AiController contract.
export interface SimilarCase {
  score: number; // cosine similarity 0..1
  decisionId: number;
  manufacturer: string;
  product: string;
  category: string;
  country: string;
  region: string;
  decisionStatus: string;
  decisionReason?: string;
  conditions?: string;
  risks?: string;
  decisionDate: string;
}

export interface SemanticSearchResponse {
  query: string;
  model: string;
  count: number;
  results: SimilarCase[];
  disclaimer: string;
}

// UI-side chat model.
export type SearchMode = 'exact' | 'smart';
export type MessageState = 'loading' | 'ok' | 'empty' | 'error' | 'info';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  manufacturer?: ManufacturerRef;
  products?: Product[];
  cases?: SimilarCase[]; // semantic-search results
  disclaimer?: string;
  state?: MessageState;
}
