import { httpClient } from '@/lib/configs/httpClient';

type DashboardStats = {
  totalUsers: number;
  activeSessions: number;
  revenue: number;
};

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const response = await httpClient.get<DashboardStats>('/api/dashboard/stats');
    return response.data;
  }
}
