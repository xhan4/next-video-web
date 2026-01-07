'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  Card,
  CardBody,
  Progress,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Spinner,
  Link,
  Code,
  useToast,
  Icon,
  Flex,
  Heading,
  Container,
} from '@chakra-ui/react';
import { VideoGenerationRequest, VideoTask } from '@/types';
import { createVideoTask, getVideoTaskStatus } from '@/lib/global';
import { CheckCircleIcon, WarningIcon, TimeIcon, DownloadIcon } from '@chakra-ui/icons';

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('一只可爱的猫咪在草地上玩耍，阳光明媚，微风吹拂...');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskData, setTaskData] = useState<VideoTask | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState('');
  const toast = useToast();

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
            toast({
              title: '视频生成成功！',
              status: 'success',
              duration: 3000,
              position: 'top',
            });
          } else if (data.status === 'failed') {
            clearInterval(interval);
            setPollingInterval(null);
            setError('视频生成失败: ' + (data.error || data.failure_reason));
            toast({
              title: '视频生成失败',
              description: data.error || data.failure_reason,
              status: 'error',
              duration: 5000,
              position: 'top',
            });
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
      toast({
        title: '请输入视频描述',
        status: 'warning',
        duration: 3000,
        position: 'top',
      });
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
        toast({
          title: '任务创建成功',
          description: '视频生成任务已开始，请耐心等待...',
          status: 'info',
          duration: 3000,
          position: 'top',
        });
      } else {
        setError('创建任务失败: ' + response.msg);
        toast({
          title: '创建任务失败',
          description: response.msg,
          status: 'error',
          duration: 5000,
          position: 'top',
        });
      }
    } catch (err) {
      setError('网络错误: ' + (err as Error).message);
      toast({
        title: '网络错误',
        description: '请检查网络连接后重试',
        status: 'error',
        duration: 5000,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  // 获取状态图标和颜色
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'succeeded':
        return { icon: CheckCircleIcon, color: 'green', label: '成功' };
      case 'failed':
        return { icon: WarningIcon, color: 'red', label: '失败' };
      case 'processing':
        return { icon: TimeIcon, color: 'blue', label: '处理中' };
      default:
        return { icon: TimeIcon, color: 'gray', label: status };
    }
  };

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* 页面标题 */}
        <Box textAlign="center">
          <Heading as="h1" size="2xl" color="blue.600" mb={2}>
            Sora2 视频生成器
          </Heading>
          <Text fontSize="lg" color="gray.600">
            使用AI技术，让您的创意变为生动的视频
          </Text>
        </Box>

        {/* 输入区域 */}
        <Card shadow="lg" borderRadius="xl">
          <CardBody p={6}>
            <VStack spacing={4}>
              <Box w="full">
                <Text fontWeight="semibold" mb={2} color="gray.700">
                  视频描述
                </Text>
                <Textarea
                  size="lg"
                  rows={5}
                  placeholder="请输入详细的视频描述，例如：一只可爱的猫咪在草地上玩耍，阳光明媚，微风吹拂..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  focusBorderColor="blue.500"
                  resize="vertical"
                />
              </Box>
              
              <Button
                colorScheme="blue"
                size="lg"
                w="full"
                onClick={generateVideo}
                isLoading={isLoading || !!pollingInterval}
                loadingText={pollingInterval ? '生成中...' : '提交中...'}
                leftIcon={<Icon as={DownloadIcon} />}
                disabled={!prompt.trim()}
              >
                生成视频
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        )}

        {/* 进度显示 */}
        {taskData && (
          <Card shadow="lg" borderRadius="xl">
            <CardBody p={6}>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size="md">生成进度</Heading>
                  <Badge 
                    colorScheme={getStatusConfig(taskData.status).color}
                    fontSize="md"
                    px={3}
                    py={1}
                  >
                    <HStack spacing={1}>
                      <Icon as={getStatusConfig(taskData.status).icon} />
                      <Text>{getStatusConfig(taskData.status).label}</Text>
                    </HStack>
                  </Badge>
                </HStack>

                {/* 进度条 */}
                <Box>
                  <Progress 
                    value={taskData.progress} 
                    size="lg" 
                    colorScheme="blue"
                    borderRadius="full"
                    hasStripe={taskData.status === 'processing'}
                    isAnimated={taskData.status === 'processing'}
                  />
                  <Text textAlign="center" mt={2} fontSize="lg" fontWeight="medium">
                    {taskData.progress}%
                  </Text>
                </Box>

                {/* 任务信息 */}
                <Card variant="outline" bg="gray.50">
                  <CardBody>
                    <VStack spacing={3} align="stretch" fontSize="sm">
                      <HStack justify="space-between">
                        <Text fontWeight="semibold">任务ID:</Text>
                        <Code fontSize="xs">{taskData.id}</Code>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold">开始时间:</Text>
                        <Text>{formatTime(taskData.start_time)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold">结束时间:</Text>
                        <Text>{taskData.end_time ? formatTime(taskData.end_time) : '进行中'}</Text>
                      </HStack>
                      {taskData.error && (
                        <HStack justify="space-between">
                          <Text fontWeight="semibold">错误信息:</Text>
                          <Text color="red.500">{taskData.error}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* 结果显示 */}
        {taskData && taskData.status === 'succeeded' && taskData.results && taskData.results.length > 0 && (
          <Card shadow="lg" borderRadius="xl">
            <CardBody p={6}>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="green.600">
                  🎉 视频生成成功！
                </Heading>
                
                {taskData.results.map((result, index) => (
                  <Box key={index}>
                    <VStack spacing={4} align="stretch">
                      {/* 视频播放器 */}
                      <Box textAlign="center">
                        <video
                          controls
                          style={{ 
                            maxWidth: '100%', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                          }}
                          src={result.url}
                        >
                          您的浏览器不支持视频播放。
                        </video>
                      </Box>

                      {/* 视频信息 */}
                      <Card variant="outline" bg="green.50">
                        <CardBody>
                          <VStack spacing={3} align="stretch" fontSize="sm">
                            <HStack justify="space-between">
                              <Text fontWeight="semibold">视频ID:</Text>
                              <Code fontSize="xs">{result.pid}</Code>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontWeight="semibold">去水印:</Text>
                              <Badge colorScheme={result.removeWatermark ? 'green' : 'orange'}>
                                {result.removeWatermark ? '是' : '否'}
                              </Badge>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontWeight="semibold">视频链接:</Text>
                              <Link href={result.url} isExternal color="blue.500">
                                查看视频
                              </Link>
                            </HStack>
                            {taskData.end_time && (
                              <HStack justify="space-between">
                                <Text fontWeight="semibold">总耗时:</Text>
                                <Text>
                                  {Math.round((taskData.end_time - taskData.start_time) / 60)}分钟
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                    
                    {taskData.results&&(index < taskData.results.length - 1) && <Divider my={6} />}
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
}