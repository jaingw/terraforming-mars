export interface ApiResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
}

export function apiSuccess<T = undefined>(data?: T, message = 'success'): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    message,
  };
  if (data !== undefined) {
    response.data = data;
  }
  return response;
}

export function apiFailure(message: string): ApiResponse {
  return {
    success: false,
    message,
  };
}
