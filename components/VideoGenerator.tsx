'use client';

import { useState, useEffect } from 'react';
import { VideoGenerationRequest, VideoTask } from '@/types';
import { createVideoTask, getVideoTaskStatus } from '@/lib/global';

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('一只可爱的猫咪在草地上玩耍，阳光明媚，微风吹拂...');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskData, setTaskData] = useState<VideoTask | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState('');

  // 清理轮询
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // 开始轮询任务状态
  const startPolling = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await getVideoTaskStatus(taskId);
        if (response.code === 0) {
          const data = response.data;
          setTaskData(data);

          // 检查任务状态
          if (data.status === 'succeeded') {
            clearInterval(interval);
            setPollingInterval(null);
          } else if (data.status === 'failed') {
            clearInterval(interval);
            setPollingInterval(null);
            setError('视频生成失败: ' + (data.error || data.failure_reason));
          }
        } else if (response.code === -22) {
          clearInterval(interval);
          setPollingInterval(null);
          setError('任务不存在');
        }
      } catch (err) {
        console.error('轮询错误:', err);
      }
    }, 2000); // 每2秒轮询一次

    setPollingInterval(interval);
  };

  // 生成视频
  const generateVideo = async () => {
    if (!prompt.trim()) {
      setError('请输入视频描述');
      return;
    }

    setIsLoading(true);
    setError('');
    setTaskData(null);

    try {
      const requestData: VideoGenerationRequest = {
        model: "sora-2",
        prompt: prompt,
        aspectRatio: "9:16",
        duration: 10
      };

      const response = await createVideoTask(requestData);
      
      if (response.code === 0) {
        const taskId = response.data.id;
        setCurrentTaskId(taskId);
        startPolling(taskId);
      } else {
        setError('创建任务失败: ' + response.msg);
      }
    } catch (err) {
      setError('网络错误: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // 获取状态样式
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600 font-bold';
      case 'failed':
        return 'text-red-600 font-bold';
      case 'processing':
        return 'text-blue-600 font-bold';
      default:
        return 'text-gray-600 font-bold';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Sora2视频生成</h1>
      
      {/* 输入区域 */}
      <div className="mb-6">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          视频描述
        </label>
        <textarea
          id="prompt"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="请输入视频描述..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={generateVideo}
          disabled={isLoading || !!pollingInterval}
          className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '生成中...' : '生成视频'}
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* 进度显示 */}
      {taskData && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">生成进度</h2>
          
          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${taskData.progress}%` }}
            ></div>
          </div>
          <div className="text-center mb-4">{taskData.progress}%</div>
          
          {/* 任务信息 */}
          <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
            <p><strong>任务ID:</strong> {taskData.id}</p>
            <p><strong>状态:</strong> <span className={getStatusClass(taskData.status)}>{taskData.status}</span></p>
            <p><strong>进度:</strong> {taskData.progress}%</p>
            <p><strong>开始时间:</strong> {formatTime(taskData.start_time)}</p>
            <p><strong>结束时间:</strong> {taskData.end_time ? formatTime(taskData.end_time) : '进行中'}</p>
            <p><strong>回调URL:</strong> {taskData.callback_url}</p>
            {taskData.error && <p><strong>错误信息:</strong> {taskData.error}</p>}
            {taskData.failure_reason && <p><strong>失败原因:</strong> {taskData.failure_reason}</p>}
          </div>
        </div>
      )}

      {/* 结果显示 */}
      {taskData && taskData.status === 'succeeded' && taskData.results && taskData.results.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">生成结果</h2>
          {taskData.results.map((result, index) => (
            <div key={index} className="mb-4">
              <video
                controls
                className="w-full max-w-md mx-auto"
                src={result.url}
              >
                您的浏览器不支持视频播放。
              </video>
              <div className="mt-4 bg-gray-50 p-4 rounded-md font-mono text-sm">
                <p><strong>视频ID:</strong> {result.pid}</p>
                <p><strong>去水印:</strong> {result.removeWatermark ? '是' : '否'}</p>
                <p><strong>视频URL:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.url}</a></p>
                <p><strong>任务状态:</strong> <span className={getStatusClass(taskData.status)}>{taskData.status}</span></p>
                {taskData.end_time && (
                  <p><strong>总耗时:</strong> {Math.round((taskData.end_time - taskData.start_time) / 60)}分钟</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}