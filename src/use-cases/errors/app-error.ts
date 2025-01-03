export type IRequest = {
  message: string;
  friend?: string;
  status?: number;
  code?: string;
  data?: Array<any>;
};

export class AppError {
  public readonly message: string;

  public readonly friend: string;

  public readonly statusCode: number;

  public readonly code: string;

  public readonly data: Array<any>;

  constructor({
    message,
    friend = "",
    status = 400,
    code = "",
    data,
  }: IRequest) {
    this.statusCode = status;
    this.code = code;
    this.message = message;
    this.friend = friend || message;
    this.data = data || [];
  }
}
