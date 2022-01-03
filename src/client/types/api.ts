export interface ApiMessage {
  type: string;
  message: string;
}

export interface Pagination {
  previous: number | null;
  current: number;
  next: number | null;
  total: number;
}
