export class IdezErrors {
  constructor() {}
  public message(error: unknown) {
    const data = error.response.data;
    return data?.message ? data : error;
  }
}
