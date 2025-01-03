export function makeFetchReturn({ params, count, data }: any) {
  return {
    meta: {
      current_page: params.pagination?.page,
      total_pages: Math.ceil(count / (params.pagination?.perPage ?? 5)),
      total_items: count,
      total_items_page: params.pagination?.perPage,
    },
    ...data,
  };
}
