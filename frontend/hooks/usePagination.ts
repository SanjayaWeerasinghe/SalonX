import { useState } from 'react';

interface UsePaginationReturn {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetPage: () => void;
}

export function usePagination(initialPage: number = 1, initialLimit: number = 50): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const resetPage = () => setPage(1);

  return {
    page,
    limit,
    setPage,
    setLimit,
    resetPage,
  };
}
