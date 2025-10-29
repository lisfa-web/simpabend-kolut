import { useState, useMemo } from "react";

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export const usePagination = (initialPageSize: number = 10) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const paginateData = <T,>(data: T[] | undefined): T[] => {
    if (!data) return [];
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return data.slice(start, end);
  };

  const getPageCount = (totalItems: number): number => {
    return Math.ceil(totalItems / pagination.pageSize);
  };

  const goToPage = (pageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex }));
  };

  const nextPage = () => {
    setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
  };

  const previousPage = () => {
    setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
  };

  const setPageSize = (pageSize: number) => {
    setPagination({ pageIndex: 0, pageSize });
  };

  return {
    pagination,
    paginateData,
    getPageCount,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
  };
};
