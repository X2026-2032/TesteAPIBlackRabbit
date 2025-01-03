import moment from "moment";

export type TransactionsParams = {
  all: boolean;
  page: string;
  status: string;
  type: string;
  end_date: string;
  start_date: string;
  per_page: string;
  graphic_account_id: string;
};
export class TransactionsQueryParams {
  public static params(params: Partial<TransactionsParams>) {
    const query: Record<string, any> = {};

    if (params.start_date && params.end_date) {
      const startDate = new Date(params.start_date);
      const endDate = new Date(params.end_date);

      query.created_at = {
        lte: moment(endDate).add(3, "h").add(1, "d").toDate(),
        gte: moment(startDate).add(3, "h").toDate(),
      };
    }

    if (params.status) {
      query.status = params.status;
    }

    if (params.type) {
      query.type = params.type;
    }

    if (params.graphic_account_id) {
      query.graphic_account_id = params.graphic_account_id;
    }

    return {
      where: query,
      per_page: +params.per_page!,
      page: TransactionsQueryParams.paginate(params.page!, params.per_page!),
      start_date: params.start_date,
      end_date: params.end_date,
    };
  }

  public static paginate(page: string, per_page: string) {
    const pageNumber = parseInt(page, 10);
    const itemsPerPage = parseInt(per_page, 10);
    return (pageNumber - 1) * itemsPerPage;
  }
}
