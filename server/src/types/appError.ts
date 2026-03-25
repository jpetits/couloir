export class AppError extends Error {
  status: number;
  constructor(message: string, status: number, statusCode?: string) {
    super(message);
    this.status = status;
  }
}
