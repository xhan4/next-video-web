import { ApiResponse, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, UserInfo, UserPointsAndMembership, VideoGenerationRequest, VideoTask } from "@/types"
import request from "@/utils/request"

// 登录
const login = (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => 
  request('/user/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

// 刷新访问令牌
const refreshToken = (refreshTokenData: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => 
  request('/user/refreshToken', {
    method: 'POST',
    body: JSON.stringify(refreshTokenData),
  })

// 获取用户信息
const getUserInfo = (): Promise<ApiResponse<UserInfo>> => 
  request('/user/getUserInfo', {
    method: 'GET',
  })

// 创建视频生成任务
const createVideoTask = (data: VideoGenerationRequest): Promise<ApiResponse<{ id: string }>> => 
  request('/video-ai/videos', {
    method: 'POST',
    body: JSON.stringify(data),
  })

// 获取视频生成任务状态
const getVideoTaskStatus = (taskId: string): Promise<ApiResponse<VideoTask>> => 
  request(`/video-ai/videos/${taskId}/result`)

// 获取用户积分和会员等级
const getUserPointsAndMembership = (): Promise<ApiResponse<UserPointsAndMembership>> => 
  request('/user/points-and-membership', {
    method: 'GET',
  })


export { login, refreshToken, getUserInfo, createVideoTask, getVideoTaskStatus,getUserPointsAndMembership }