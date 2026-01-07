// API响应类型
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 登录请求类型
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应类型
export interface LoginResponse {
  token: string;
  refreshToken: string;
  userInfo: {
    userId: number;
    username: string;
    avatar: string;
    roles: string[];
    nickname: string;
    active: number;
    create_time: string;
    update_time: string;
  };
}

// 刷新Token请求类型
export interface RefreshTokenRequest {
  refresh_token: string;
}

// 刷新Token响应类型
export interface RefreshTokenResponse {
  refreshToken: string;
  token: string;
}

// 用户信息类型
export interface UserInfo {
  userId: number;
  username: string;
  avatar: string;
  roles: string[];
  nickname: string;
  active: number;
  create_time: string;
  update_time: string;
}

// 视频生成请求类型
export interface VideoGenerationRequest {
  model: string;
  prompt: string;
  aspectRatio: string;
  duration: number;
}

// 视频生成任务类型
export interface VideoTask {
  id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  progress: number;
  start_time: number;
  end_time?: number;
  callback_url: string;
  error?: string;
  failure_reason?: string;
  results?: VideoResult[];
}

// 视频结果类型
export interface VideoResult {
  pid: string;
  url: string;
  removeWatermark: boolean;
}