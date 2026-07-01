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

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  ingredients?: string | null;
  description?: string | null;
}

export interface ManufacturerRef {
  id: number;
  code: string;
  name: string;
}

export interface ProductsResponse {
  manufacturer: ManufacturerRef;
  products: Product[];
}

// UI-side chat model.
export type MessageState = 'loading' | 'ok' | 'empty' | 'error';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  manufacturer?: ManufacturerRef;
  products?: Product[];
  state?: MessageState;
}
