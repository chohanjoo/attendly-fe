FROM node:23-alpine AS base

# 작업 디렉토리 설정
WORKDIR /app

# package.json 복사
COPY package.json ./

# 소스 코드 복사
COPY . .

# 의존성 설치 (--legacy-peer-deps 옵션 추가)
RUN npm install --legacy-peer-deps

# Node 사용자 권한 설정
RUN chown -R node:node /app
USER node

# Next.js 개발 서버 실행
CMD ["npx", "next", "dev", "-p", "3000"]

# 포트 노출
EXPOSE 3000 