'use client';

import { useEffect } from 'react';
import logger from '@/lib/logger';

export function DiscordLoggerProvider() {
  useEffect(() => {
    // 환경 변수에서 Discord 웹훅 URL 가져오기
    const discordWebhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;
    
    if (discordWebhookUrl) {
      // Discord 웹훅 초기화
      logger.initDiscord(discordWebhookUrl);
      logger.info('Discord 로깅이 초기화되었습니다.');
    } else {
      console.warn('Discord 웹훅 URL이 설정되지 않았습니다. Discord 로깅이 비활성화됩니다.');
    }
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않습니다.
  return null;
} 