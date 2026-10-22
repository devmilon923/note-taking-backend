type PaginationParams = {
  totalData: number;
  page: number;
  limit: number;
};

export function buildPagination({ totalData, page, limit }: PaginationParams) {
  const totalPage = Math.ceil(totalData / limit);
  const nextPage = page < totalPage ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return {
    totalData,
    totalPage,
    currentPage: page,
    nextPage,
    prevPage,
  };
}
