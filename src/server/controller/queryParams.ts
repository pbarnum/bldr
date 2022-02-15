export interface Pagination {
  page: number;
  limit: number;
}

export interface Archived {
  archived: string;
}

export type ListResourcesQP = Pagination & Archived;

export interface Verify {
  email: string;
  token: string;
}
