export interface SnsUserInfo {
  id: string;
}

export interface SnsService {
  getUserInfo(accessToken: string): Promise<SnsUserInfo>;
}
