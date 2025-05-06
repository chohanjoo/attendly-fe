/**
 * 환경에 따라 다른 로깅 수준을 제공하는 로거 유틸리티
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// User 타입 정의 가져오기
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  [key: string]: any; // 추가 필드가 있을 수 있음
}

// Discord 웹훅 설정
let discordWebhookUrl: string | null = null;

// Rate limiting 변수
const RATE_LIMIT_INTERVAL = 2000; // 2초 간격 (밀리초)
let logQueue: Array<{level: string, args: any[]}> = [];
let isProcessingQueue = false;

/**
 * Discord 웹훅 초기화 함수
 * @param webhookUrl Discord 웹훅 URL
 */
const initDiscordWebhook = (webhookUrl: string) => {
  if (!webhookUrl) {
    console.warn('[DISCORD] 웹훅 URL이 제공되지 않았습니다.');
    return;
  }
  
  try {
    discordWebhookUrl = webhookUrl;
    console.info('[DISCORD] 웹훅이 초기화되었습니다.');
  } catch (error) {
    console.error('[DISCORD] 웹훅 초기화 실패:', error);
  }
};

/**
 * 큐에 있는 로그 메시지 처리
 */
const processQueue = async () => {
  if (isProcessingQueue || logQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  try {
    const { level, args } = logQueue.shift()!;
    await sendToDiscordDirectly(level, ...args);
    
    // 다음 처리를 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_INTERVAL));
    
    isProcessingQueue = false;
    processQueue(); // 다음 항목 처리
  } catch (error) {
    console.error('[DISCORD] 큐 처리 중 오류:', error);
    isProcessingQueue = false;
    
    // 오류가 발생해도 계속 처리
    setTimeout(processQueue, RATE_LIMIT_INTERVAL);
  }
};

/**
 * Discord로 로그 메시지 전송 (큐에 추가)
 * @param level 로그 레벨 (DEBUG, INFO, WARN, ERROR)
 * @param args 로그 메시지와 데이터
 */
const sendToDiscord = (level: string, ...args: any[]) => {
  if (!discordWebhookUrl) return;
  
  // 큐에 로그 메시지 추가
  logQueue.push({ level, args });
  
  // 큐 처리 시작
  processQueue();
};

/**
 * Discord로 로그 메시지 직접 전송 (큐 처리용)
 * @param level 로그 레벨 (DEBUG, INFO, WARN, ERROR)
 * @param args 로그 메시지와 데이터
 */
const sendToDiscordDirectly = async (level: string, ...args: any[]) => {
  if (!discordWebhookUrl) return;
  
  try {
    // 로그 메시지 준비
    const content = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join('\n');
    
    // 임베드 생성
    const embed = {
      title: `[${level}] 로그 메시지`,
      color: getColorForLevel(level),
      description: content,
      timestamp: new Date().toISOString()
    };
    
    // Discord 웹훅으로 전송
    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Attendly 로그 봇',
        embeds: [embed]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Discord 웹훅 전송 실패: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('[DISCORD] 로그 전송 실패:', error);
    throw error; // 큐 처리 로직이 오류를 처리할 수 있도록 다시 throw
  }
};

/**
 * 로그 레벨에 따른 색상 반환
 */
const getColorForLevel = (level: string): number => {
  switch (level) {
    case 'DEBUG': return 0x808080; // 회색
    case 'INFO': return 0x4287f5;  // 파랑
    case 'WARN': return 0xf5a742;  // 주황
    case 'ERROR': return 0xf54242; // 빨강
    default: return 0xffffff;      // 흰색
  }
};

/**
 * 로그 레벨별로 다른 포맷과 조건을 가진 로거
 */
const logger = {
  /**
   * Discord 웹훅 초기화
   * @param webhookUrl Discord 웹훅 URL
   */
  initDiscord: (webhookUrl: string) => {
    initDiscordWebhook(webhookUrl);
  },

  /**
   * 디버그 로그 - 개발 환경에서만 출력
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
      
      // Discord에 전송 (개발 환경에서만)
      if (isDevelopment && discordWebhookUrl) {
        sendToDiscord('DEBUG', ...args);
      }
    }
  },

  /**
   * 정보 로그 - 모든 환경에서 출력
   */
  info: (...args: any[]) => {
    console.info('[INFO]', ...args);
    
    // Discord에 전송
    if (discordWebhookUrl) {
      sendToDiscord('INFO', ...args);
    }
  },

  /**
   * 경고 로그 - 모든 환경에서 출력
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
    
    // Discord에 전송
    if (discordWebhookUrl) {
      sendToDiscord('WARN', ...args);
    }
  },

  /**
   * 에러 로그 - 모든 환경에서 출력
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
    
    // Discord에 전송
    if (discordWebhookUrl) {
      sendToDiscord('ERROR', ...args);
    }
  },

  /**
   * 환경 정보 로깅 - 앱 시작 시 유용
   */
  logEnvironment: () => {
    if (isDevelopment) {
      console.group('🚀 환경 정보');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('환경:', process.env.NEXT_PUBLIC_ENV);
      console.groupEnd();
      
      // Discord에 전송
      if (discordWebhookUrl) {
        const fields = [
          { name: 'NODE_ENV', value: process.env.NODE_ENV || 'undefined' },
          { name: 'API URL', value: process.env.NEXT_PUBLIC_API_URL || 'undefined' },
          { name: '환경', value: process.env.NEXT_PUBLIC_ENV || 'undefined' }
        ];
        
        sendToDiscord('INFO', { 
          title: '🚀 환경 정보', 
          fields 
        });
      }
    }
  },

  /**
   * 로그인한 유저 정보 로깅
   * @param user 사용자 객체
   */
  logUserInfo: (user: User | null) => {
    if (!user) {
      console.log('[USER] 로그인한 사용자 없음');
      return;
    }

    console.group('👤 로그인한 유저 정보');
    console.log('ID:', user.id);
    console.log('이름:', user.name);
    console.log('이메일:', user.email);
    console.log('역할:', user.role);
    
    // 추가 정보가 있다면 출력
    const additionalKeys = Object.keys(user).filter(
      key => !['id', 'name', 'email', 'role'].includes(key)
    );
    
    if (additionalKeys.length > 0) {
      console.group('추가 정보');
      additionalKeys.forEach(key => {
        console.log(`${key}:`, user[key]);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    // Discord에 전송
    if (discordWebhookUrl) {
      // 기본 필드 추가
      const fields = [
        { name: 'ID', value: user.id },
        { name: '이름', value: user.name },
        { name: '이메일', value: user.email },
        { name: '역할', value: user.role }
      ];
      
      // 추가 정보가 있다면 필드에 추가
      if (additionalKeys.length > 0) {
        additionalKeys.forEach(key => {
          const value = typeof user[key] === 'object'
            ? JSON.stringify(user[key])
            : String(user[key]);
          fields.push({ name: key, value });
        });
      }
      
      sendToDiscord('INFO', {
        title: '👤 로그인한 유저 정보',
        fields,
        color: 0x42f587
      });
    }
  },
};

// 앱 시작 시 환경 정보 출력
if (typeof window !== 'undefined' && isDevelopment) {
  logger.logEnvironment();
}

export default logger; 