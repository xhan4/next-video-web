import { ApiResponse, LoginRequest, LoginResponse, VideoGenerationRequest, VideoTask } from "@/types"
import request from "@/utils/request"

  // 登录
const login = (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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

export { login, createVideoTask, getVideoTaskStatus }