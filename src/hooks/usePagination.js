import { useMemo, useState } from "react";

export function usePagination(items, resetKey = "", initialPageSize = 10) {
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: initialPageSize,
    resetKey,
  });

  const isCurrentFilter = pagination.resetKey === resetKey;
  const pageSize = pagination.pageSize;
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(isCurrentFilter ? pagination.page : 1, pageCount);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  function setPage(nextPage) {
    const clampedPage = Math.min(Math.max(1, nextPage), pageCount);
    setPagination((current) => ({ ...current, page: clampedPage, resetKey }));
  }

  function setPageSize(nextPageSize) {
    setPagination({ page: 1, pageSize: nextPageSize, resetKey });
  }

  return {
    page,
    pageCount,
    pageSize,
    paginatedItems,
    setPage,
    setPageSize,
    totalItems: items.length,
  };
}
