interface Pagination {
  pagination: {
    previous: number | null;
    current: number;
    next: number | null;
    total: number;
  };
}

export default (offset: number, limit: number, total: number): Pagination => {
  const page = offset / limit + 1;
  return {
    pagination: {
      previous: offset > 0 ? page - 1 : null,
      current: page,
      next: offset + limit < total ? page + 1 : null,
      total,
    },
  };
};
