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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from '@chakra-ui/react';
import { VideoGenerationRequest, VideoTask } from '@/types';
import { createVideoTask, getVideoTaskStatus } from '@/lib/global';
import { CheckCircleIcon, WarningIcon, TimeIcon, DownloadIcon, AddIcon } from '@chakra-ui/icons';

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [duration, setDuration] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [taskData, setTaskData] = useState<VideoTask | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // 添加状态控制Popover的打开和关闭
  const [isAspectRatioOpen, setIsAspectRatioOpen] = useState(false);
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const toast = useToast();

  // 宽高比选项
  const aspectRatioOptions = [
    { value: '9:16', label: '9:16 (竖屏)' },
    { value: '16:9', label: '16:9 (横屏)' }
  ];

  // 时长选项
  const durationOptions = [
    { value: 10, label: '10秒' },
    { value: 15, label: '15秒' }
  ];
// 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        toast({
          title: '文件类型错误',
          description: '请上传图片文件',
          status: 'error',
          duration: 3000,
          position: 'top',
        });
        return;
      }

      // 检查文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: '文件过大',
          description: '图片大小不能超过5MB',
          status: 'error',
          duration: 3000,
          position: 'top',
        });
        return;
      }

      setImageFile(file);
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 清除图片
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // 重置文件输入框的值，确保可以再次选择同一张图片
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // 将图片转换为base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // 移除data:image/...;base64,前缀
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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
              title: '生成成功',
              status: 'success',
              variant: 'element-style',
            });
          } else if (data.status === 'failed') {
            clearInterval(interval);
            setPollingInterval(null);
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
      toast({
        title: '请输入视频描述',
        status: 'warning',
        duration: 3000,
        position: 'top',
      });
      return;
    }

    setIsLoading(true);
    setTaskData(null);

    try {
      const requestData: VideoGenerationRequest = {
        model: "sora-2",
        prompt: prompt,
        aspectRatio: aspectRatio,
        duration: duration
      };

      // 如果有图片，转换为base64并添加到请求数据
      if (imageFile) {
        try {
          const base64Image = await convertImageToBase64(imageFile);
          requestData.url = base64Image;
        } catch (err) {
          toast({
            title: '图片处理失败',
            description: '请重新选择图片',
            status: 'error',
            duration: 5000,
            position: 'top',
          });
          setIsLoading(false);
          return;
        }
      }

      const response = await createVideoTask(requestData);
      
      if (response.code === 0) {
        const taskId = response.data.id;
        startPolling(taskId);
        toast({
          title: '任务创建成功',
          description: '视频生成任务已开始，请耐心等待...',
          status: 'info',
          duration: 3000,
          position: 'top',
        });
      } else {
        toast({
          title: '创建任务失败',
          description: response.msg,
          status: 'error',
          duration: 5000,
          position: 'top',
        });
      }
    } catch (err) {
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
    <Container maxW={{ base: "full", md: "4xl" }} px={{ base: 4, md: 0 }} py={{ base: 4, md: 8 }}>
      <VStack spacing={{ base: 6, md: 8 }} align="stretch">
        {/* 页面标题 */}
        <Box textAlign="center">
          <Heading as="h3" size={{ base: "xl", md: "2xl" }} color="blue.600" mb={2}>
            Sora2 视频生成器
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
            使用AI技术，让您的创意变为生动的视频
          </Text>
        </Box>

        {/* 输入区域 */}
        <Card shadow="lg" borderRadius="xl">
          <CardBody p={{ base: 4, md: 6 }}>
            <VStack spacing={{ base: 3, md: 4 }}>
              {/* 图片上传和文本描述区域 */}
              <Box w="full">
                <Box position="relative">
                  {/* 文本描述区域 - 作为背景容器 */}
                  <Textarea
                    size={{ base: "md", md: "lg" }}
                    rows={4}
                    placeholder="请输入详细的视频描述，例如：一只可爱的猫咪在草地上玩耍，阳光明媚，微风吹拂..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    focusBorderColor="blue.500"
                    resize="vertical"
                    fontSize={{ base: "sm", md: "md" }}
                    pl="70px" // 为缩小后的图片上传框留出空间
                    minH="120px"
                  />
                  
                  {/* 图片上传区域 - 悬浮在文本描述框左上角 */}
                   <Box
                    position="absolute"
                    top="8px"
                    left="8px"
                    width="50px"
                    height="50px"
                    border="2px dashed"
                    borderColor={imagePreview ? "gray.200" : "gray.300"}
                    borderRadius="md"
                    bg="white"
                    cursor="pointer"
                    transition="all 0.2s"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    zIndex={1}
                    transform="rotate(15deg)"
                    _hover={{ borderColor: "blue.400" , transform: "rotate(0deg) scale(1.05)" }}
                  >
                    {imagePreview ? (
                      <>
                        <Box
                          position="absolute"
                          top={-2}
                          right={-2}
                          zIndex={2}
                          onClick={(e) => {
                            e.stopPropagation();
                            clearImage();
                          }}
                        >
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="solid"
                            borderRadius="full"
                            p={0}
                            minW="auto"
                            h="auto"
                            width="18px"
                            height="18px"
                            fontSize="14px"
                            fontWeight="bold"
                            boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                            bg="red.500"
                            color="white"
                            _hover={{ 
                              bg: "red.600",
                              transform: "scale(1.1)"
                            }}
                            _active={{
                              bg: "red.700",
                              transform: "scale(0.95)"
                            }}
                            transition="all 0.2s"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            ×
                          </Button>
                        </Box>
                        <img
                          src={imagePreview}
                          alt="预览图片"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '6px'
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <Icon as={AddIcon} boxSize={3} color="gray.400" />
                        <Text fontSize="10px" color="gray.500" textAlign="center" lineHeight="1.2" mt={1}>
                          首帧
                        </Text>
                      </>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* 参数选择和生成按钮 */}
              <Box w="full">
                <HStack spacing={3} align="center" justify="flex-end">
                  {/* 宽高比和时长按钮组 */}
                  <HStack spacing={4} flex={1}>
                   {/* 宽高比选择弹出框 */}
                    <Popover 
                      placement="bottom-start" 
                      isOpen={isAspectRatioOpen}
                      onClose={() => setIsAspectRatioOpen(false)}
                    >
                      <PopoverTrigger>
                        <Box 
                          position="relative" 
                          cursor="pointer" 
                          p={1}
                          _hover={{ color: "blue.500" }}
                          display="flex"
                          alignItems="center"
                          gap={1}
                          onClick={() => setIsAspectRatioOpen(!isAspectRatioOpen)}
                        >
                          <Text fontSize="sm" fontWeight="medium">
                            {aspectRatioOptions.find(opt => opt.value === aspectRatio)?.label.split(' ')[0] || '9:16'}
                          </Text>
                          <Box 
                            width="12px" 
                            height="12px" 
                            display="flex" 
                            alignItems="center" 
                            justifyContent="center"
                            transform="translateY(4px)"
                          >
                            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" width="100%" height="100%">
                              <path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
                            </svg>
                          </Box>
                        </Box>
                      </PopoverTrigger>
                      <PopoverContent width="auto">
                        <PopoverBody p={2}>
                          <VStack spacing={1}>
                            {aspectRatioOptions.map((option) => (
                              <Button
                                key={option.value}
                                variant={aspectRatio === option.value ? 'solid' : 'ghost'}
                                colorScheme={aspectRatio === option.value ? 'blue' : 'gray'}
                                size="sm"
                                onClick={() => {
                                  setAspectRatio(option.value);
                                  setIsAspectRatioOpen(false); // 选择后关闭弹窗
                                }}
                                width="full"
                                justifyContent="flex-start"
                              >
                                {option.label}
                              </Button>
                            ))}
                          </VStack>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>

                  {/* 时长选择弹出框 */}
                    <Popover 
                      placement="bottom-start" 
                      isOpen={isDurationOpen}
                      onClose={() => setIsDurationOpen(false)}
                    >
                      <PopoverTrigger>
                        <Box 
                          position="relative" 
                          cursor="pointer" 
                          p={1}
                          _hover={{ color: "blue.500" }}
                          display="flex"
                          alignItems="center"
                          gap={1}
                          onClick={() => setIsDurationOpen(!isDurationOpen)}
                        >
                          <Text fontSize="sm" fontWeight="medium">
                            {durationOptions.find(opt => opt.value === duration)?.label || '10秒'}
                          </Text>
                          <Box 
                            width="12px" 
                            height="12px" 
                            display="flex" 
                            alignItems="center" 
                            justifyContent="center"
                            transform="translateY(4px)"
                          >
                            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" width="100%" height="100%">
                              <path fill="currentColor" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
                            </svg>
                          </Box>
                        </Box>
                      </PopoverTrigger>
                      <PopoverContent width="auto">
                        <PopoverBody p={2}>
                          <VStack spacing={1}>
                            {durationOptions.map((option) => (
                              <Button
                                key={option.value}
                                variant={duration === option.value ? 'solid' : 'ghost'}
                                colorScheme={duration === option.value ? 'blue' : 'gray'}
                                size="sm"
                                onClick={() => {
                                  setDuration(option.value);
                                  setIsDurationOpen(false); // 选择后关闭弹窗
                                }}
                                width="full"
                                justifyContent="flex-start"
                              >
                                {option.label}
                              </Button>
                            ))}
                          </VStack>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </HStack>

                  {/* 生成按钮 */}
                  <Button
                    colorScheme="blue"
                    size={{ base: "sm", md: "md" }}
                    width="140px"
                    onClick={generateVideo}
                    isLoading={isLoading || !!pollingInterval}
                    loadingText={pollingInterval ? '生成中...' : '提交中...'}
                    leftIcon={<Icon as={DownloadIcon} />}
                    disabled={!prompt.trim() || isLoading || !!pollingInterval}
                    fontSize={{ base: "sm", md: "md" }}
                    height={{ base: "40px", md: "44px" }}
                  >
                    生成视频
                  </Button>
                </HStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* 进度显示 */}
        {taskData && (
          <Card shadow="lg" borderRadius="xl">
            <CardBody p={{ base: 4, md: 6 }}>
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                <HStack justify="space-between" align="center">
                  <Heading size={{ base: "sm", md: "md" }}>生成进度</Heading>
                  <Badge 
                    colorScheme={getStatusConfig(taskData.status).color}
                    fontSize={{ base: "sm", md: "md" }}
                    px={3}
                    py={1}
                  >
                    <HStack spacing={1}>
                      <Icon as={getStatusConfig(taskData.status).icon} />
                      <Text fontSize={{ base: "xs", md: "sm" }}>{getStatusConfig(taskData.status).label}</Text>
                    </HStack>
                  </Badge>
                </HStack>

                {/* 进度条 */}
                <Box>
                  <Progress 
                    value={taskData.progress} 
                    size={{ base: "md", md: "lg" }}
                    colorScheme="blue"
                    borderRadius="full"
                    hasStripe={taskData.status === 'processing'}
                    isAnimated={taskData.status === 'processing'}
                  />
                  <Text textAlign="center" mt={2} fontSize={{ base: "md", md: "lg" }} fontWeight="medium">
                    {taskData.progress}%
                  </Text>
                </Box>

                {/* 任务信息 */}
                <Card variant="outline" bg="gray.50">
                  <CardBody>
                    <VStack spacing={2} align="stretch" fontSize={{ base: "xs", md: "sm" }}>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold">任务ID:</Text>
                        <Code fontSize={{ base: "2xs", md: "xs" }}>{taskData.id}</Code>
                      </HStack>
                      {taskData.error && (
                        <HStack justify="space-between" alignItems="start"  >
                          <Text fontWeight="semibold" w="51px">错误信息:</Text>
                          <Text color="red.600"  flex="1" bg="red.100" fontSize={{ base: "xs", md: "sm" }}>{taskData.error}</Text>
                        </HStack>
                      )}
                      {taskData.failure_reason && (
                        <HStack justify="space-between" alignItems="start" >
                          <Text fontWeight="semibold" w="51px">失败原因:</Text>
                          <Text color="red.600" flex="1" bg="red.100" fontSize={{ base: "xs", md: "sm" }}>{taskData.failure_reason}</Text>
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
            <CardBody p={{ base: 4, md: 6 }}>
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                <Heading size={{ base: "sm", md: "md" }} color="green.600">
                  🎉 视频生成成功！
                </Heading>
                
                {taskData.results.map((result, index) => (
                  <Box key={index}>
                    <VStack spacing={{ base: 3, md: 4 }} align="stretch">
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
                          <VStack spacing={2} align="stretch" fontSize={{ base: "xs", md: "sm" }}>
                            <HStack justify="space-between">
                              <Text fontWeight="semibold">视频ID:</Text>
                              <Code fontSize={{ base: "2xs", md: "xs" }}>{result.pid}</Code>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontWeight="semibold">去水印:</Text>
                              <Badge colorScheme={result.removeWatermark ? 'green' : 'orange'} fontSize={{ base: "xs", md: "sm" }}>
                                {result.removeWatermark ? '是' : '否'}
                              </Badge>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontWeight="semibold">视频链接:</Text>
                              <Link href={result.url} isExternal color="blue.500" fontSize={{ base: "xs", md: "sm" }}>
                                查看视频
                              </Link>
                            </HStack>
                            {taskData.end_time && (
                              <HStack justify="space-between">
                                <Text fontWeight="semibold">总耗时:</Text>
                                <Text fontSize={{ base: "xs", md: "sm" }}>
                                  {Math.round((taskData.end_time - taskData.start_time) / 60)}分钟
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                    
                    {taskData.results&&(index < taskData.results.length - 1) && <Divider my={{ base: 4, md: 6 }} />}
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