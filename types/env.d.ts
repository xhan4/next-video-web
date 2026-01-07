declare namespace NodeJS {
  interface ProcessEnv {
    // 公共环境变量（客户端可访问）
    readonly NEXT_PUBLIC_API_BASE_URL: string;
    readonly NEXT_PUBLIC_APP_ID: string;
    
    // 私有环境变量（仅服务端可访问）
    readonly PRIVATE_API_KEY?: string;
    readonly DATABASE_URL?: string;
  }
}