import { URLSearchParamsInit } from 'react-router-dom';

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

export type SaveQueryParams = (
  nextInit: URLSearchParamsInit,
  navigateOptions?:
    | {
        replace?: boolean | undefined;
        state?: unknown;
      }
    | undefined
) => void;
