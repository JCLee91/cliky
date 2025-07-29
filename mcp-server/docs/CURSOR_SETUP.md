# Cursor에서 Cliky MCP 서버 설정하기

## 1. 사용자 ID 확인

먼저 Cliky에서 사용하는 사용자 ID를 확인해야 합니다.

### 방법 1: 브라우저 개발자 도구 사용
1. Cliky 웹사이트에 로그인
2. 브라우저 개발자 도구 열기 (F12)
3. Application → Local Storage 확인
4. `supabase.auth.token` 항목에서 user ID 찾기

### 방법 2: 프로필 페이지에서 확인
1. Cliky 웹사이트에 로그인
2. 프로필 페이지로 이동
3. URL에서 사용자 ID 확인 (예: /profile/your-user-id)

## 2. Cursor 설정 파일 수정

### Mac/Linux
```bash
# 설정 파일 위치
~/Library/Application Support/Cursor/User/globalStorage/cursor-ai/settings.json
```

### Windows
```bash
# 설정 파일 위치
%APPDATA%\Cursor\User\globalStorage\cursor-ai\settings.json
```

### 설정 추가
```json
{
  "mcpServers": {
    "cliky-tasks": {
      "command": "node",
      "args": ["/path/to/cliky/mcp-server/build/index.js"],
      "env": {
        "SUPABASE_URL": "https://siinozkmozdwbwojoovi.supabase.co",
        "SUPABASE_ANON_KEY": "your-anon-key",
        "CLIKY_USER_ID": "your-user-id"
      }
    }
  }
}
```

## 3. Cursor 재시작

설정을 저장한 후 Cursor를 완전히 종료하고 다시 시작합니다.

## 4. 사용 방법

Cursor에서 AI와 대화할 때 다음과 같이 사용합니다:

### 작업 시작
```
"다음 태스크를 가져와줘"
"Get my next task"
"Start working on the next pending task"
```

### 작업 중
```
"현재 태스크의 상세 정보를 보여줘"
"What are the acceptance criteria?"
"Show task details for task #123"
```

### 작업 완료
```
"이 태스크를 완료하고 다음 걸 시작해"
"Complete current task and get next"
"Mark task #123 as completed"
```

### 태스크 목록
```
"내 태스크 목록을 보여줘"
"Show all my pending tasks"
"List tasks for project ABC"
```

## 5. 문제 해결

### MCP 서버가 연결되지 않을 때
1. Cursor 설정 파일의 경로가 정확한지 확인
2. 환경 변수가 올바르게 설정되었는지 확인
3. Cursor를 재시작했는지 확인

### 태스크가 보이지 않을 때
1. 사용자 ID가 올바른지 확인
2. Cliky에 로그인되어 있고 프로젝트가 있는지 확인
3. 태스크가 생성되어 있는지 확인

### 에러 메시지가 나올 때
1. Supabase URL과 anon key가 올바른지 확인
2. 네트워크 연결 상태 확인
3. MCP 서버 로그 확인
4. 태스크 상태 데이터 확인: `mcp-server/.data/` 디렉토리

## 6. 고급 설정

### 로그 레벨 설정
```json
"env": {
  "LOG_LEVEL": "debug",
  // ... 기타 환경 변수
}
```

### 개발 모드
로컬에서 개발 중인 경우:
```json
"args": ["--loader", "tsx", "/path/to/src/index.ts"]
```