import {request} from '@/client/utils/request';
import {LoginResponse, PasswordResetLinkResponse, VipCheckResponse} from './types';

class AuthService {
  login(userName: string, password: string): Promise<LoginResponse> {
    return request.post<LoginResponse>('/api/login', {userName, password});
  }

  register(userName: string, password: string): Promise<void> {
    return request.post('/api/register', {userName, password});
  }

  generatePasswordResetLink(adminUserId: string, targetUserId: string): Promise<PasswordResetLinkResponse> {
    return request.post<PasswordResetLinkResponse>('/api/v2/password-reset/generate', {adminUserId, targetUserId});
  }

  resetPassword(userName: string, token: string, password: string): Promise<void> {
    return request.post('/api/v2/password-reset/complete', {userName, token, password});
  }

  checkResetToken(userName: string, token: string): Promise<{valid: boolean}> {
    return request.post<{valid: boolean}>('/api/v2/password-reset/check', {userName, token});
  }

  checkVip(userId: string): Promise<VipCheckResponse> {
    return request.get<VipCheckResponse>('/api/isvip', {userId});
  }
}

export const authService = new AuthService();
