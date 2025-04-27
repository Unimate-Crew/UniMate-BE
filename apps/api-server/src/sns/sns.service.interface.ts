export interface SnsUserInfo {
  id: string;
}

export interface SnsService {
  getUserInfo(oAuthToken: string): Promise<SnsUserInfo>;
}
