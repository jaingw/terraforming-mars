import {request} from '@/client/utils/request';
import {LoginResponse, VipCheckResponse} from './types';

class AuthService {
  async login(userName: string, password: string): Promise<LoginResponse> {
    return request.post<LoginResponse>('/api/login', {userName, password});
  }

  async register(userName: string, password: string): Promise<void> {
    return request.post('/api/register', {userName, password});
  }

  async checkVip(userId: string): Promise<VipCheckResponse> {
    return request.get<VipCheckResponse>('/api/isvip', {userId});
  }
}

export const authService = new AuthService();
