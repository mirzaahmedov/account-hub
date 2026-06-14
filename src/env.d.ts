declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      APP_URL: string;
      JWT_SECRET: string;
      EMAIL_CLIENT_TOKEN: string;
      EMAIL_SENDER_ADDRESS: string;
    }
  }
}

export {};
