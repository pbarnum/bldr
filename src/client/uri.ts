import { SaveQueryParams } from './types/api';

export default class Uri {
  private _params: URLSearchParams;
  private params: URLSearchParams;
  private setQP: SaveQueryParams;

  constructor(qp: URLSearchParams, setQP: SaveQueryParams) {
    this._params = qp;
    this.params = new URLSearchParams(qp);
    this.setQP = setQP;
  }

  toString(): string {
    const s = this.params.toString();
    if (s === '') {
      return s;
    }
    return '?' + s;
  }

  reset(): void {
    this.params = new URLSearchParams(this._params);
  }

  save(): void {
    this.setQP(this.params);
  }

  setParams(args: { [key: string]: unknown }): this {
    Object.keys(args).forEach((k) => {
      if (args[k] === null) {
        this.params.delete(k);
      } else {
        this.params.set(k, `${args[k]}`);
      }
    });
    return this;
  }

  get page(): number | null {
    const page = this.params.get('page');
    if (!page) {
      return null;
    }
    return Number(page);
  }

  setPage(page: number | null): this {
    this.setParams({ page });
    return this;
  }

  get limit(): number | null {
    const limit = this.params.get('limit');
    if (!limit) {
      return null;
    }
    return Number(limit);
  }

  setLimit(limit: number | null): this {
    this.setParams({ limit });
    return this;
  }

  get archived(): boolean | null {
    const archived = this.params.get('archived');
    if (!archived) {
      return null;
    }
    return archived === '1' || archived.toLowerCase() === 'true';
  }

  setArchived(archived: boolean | null): this {
    this.setParams({ archived });
    return this;
  }

  get orderBy(): string | null {
    return this.params.get('orderBy');
  }

  setOrderBy(orderBy: string | null): this {
    this.setParams({ orderBy });
    return this;
  }

  get sort(): string | null {
    return this.params.get('sort');
  }

  setSort(sort: string | null): this {
    this.setParams({ sort });
    return this;
  }
}
