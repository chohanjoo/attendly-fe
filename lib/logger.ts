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
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'object') {
        const jsonString = JSON.stringify(arg, null, 2);
        
        // Discord 메시지 제한(2000자)을 고려하여 큰 객체 처리
        if (jsonString.length > 1500) {
          // 배열인 경우 다르게 처리
          if (Array.isArray(arg)) {
            return '```json\n// 큰 배열 요약 (전체 길이: ' + arg.length + '항목, ' + jsonString.length + '자)\n[\n' +
              '  // 처음 3개 항목만 표시\n' +
              arg.slice(0, 3).map(item => '  ' + JSON.stringify(item)).join(',\n') +
              (arg.length > 3 ? ',\n  // ... 그 외 ' + (arg.length - 3) + '개 항목 ...' : '') +
              '\n]\n```';
          }
          
          // 일반 객체인 경우
          const keys = Object.keys(arg);
          return '```json\n// 큰 객체 요약 (전체 길이: ' + jsonString.length + '자)\n{\n' +
            '  // 키 목록: ' + JSON.stringify(keys) + ',\n' +
            '  // 첫 번째 키 미리보기\n  "' + keys[0] + '": ' + 
            JSON.stringify(arg[keys[0]]).substring(0, 100) + 
            (JSON.stringify(arg[keys[0]]).length > 100 ? '...' : '') + 
            (keys.length > 1 ? ',\n  // ... 그 외 ' + (keys.length - 1) + '개 키 ...' : '') +
            '\n}\n```';
        }
        
        // 일반 크기 객체는 그대로 표시
        return '```json\n' + jsonString + '\n```';
      }
      return String(arg);
    });
    
    const content = formattedArgs.join('\n');
    
    // 현재 시간 포맷팅
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR');
    const dateString = now.toLocaleDateString('ko-KR');
    
    // 임베드 생성
    const embed = {
      title: `${getEmojiForLevel(level)} [${level}] 로그 메시지`,
      color: getColorForLevel(level),
      description: content,
      footer: {
        text: `Attendly | ${dateString} ${timeString}`
      },
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
 * 로그 레벨에 따른 이모지 반환
 */
const getEmojiForLevel = (level: string): string => {
  switch (level) {
    case 'DEBUG': return '🔍';
    case 'INFO': return 'ℹ️';
    case 'WARN': return '⚠️';
    case 'ERROR': return '🔴';
    default: return '📝';
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
};

// 앱 시작 시 환경 정보 출력
if (typeof window !== 'undefined' && isDevelopment) {
  logger.logEnvironment();
}

export default logger; 