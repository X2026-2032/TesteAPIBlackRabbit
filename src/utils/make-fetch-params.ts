export const makeFetchParams = (query: any) => {
  const search = query?.s ?? "";
  const page = query?.page - 1 ?? 0;
  const perPage = query?.perPage ?? 5;

  const pagination = {
    perPage,
    page: page * perPage,
  };

  return {
    search,
    pagination,
  };
};
