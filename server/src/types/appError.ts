export class AppError extends Error {
  status: number;
  statusCode: string;
  constructor(message: string, status: number, statusCode: string) {
    super(message);
    this.status = status;
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
