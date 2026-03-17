/**
 * ServiceError — 服务层错误类型
 *
 * 用于在服务层抛出带状态码的错误，便于 HTTP 层统一处理。
 */

export class ServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ServiceError';
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}
