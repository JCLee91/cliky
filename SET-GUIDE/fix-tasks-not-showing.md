# 태스크가 표시되지 않는 문제 해결 가이드

## 문제 원인 분석

art4onenall@gmail.com 계정에서 태스크가 표시되지 않는 문제는 다음 중 하나일 가능성이 높습니다:

1. **profiles 테이블 누락**: profiles 테이블이 생성되기 전에 가입한 사용자
2. **RLS 정책 문제**: auth.uid()가 제대로 작동하지 않음
3. **세션 문제**: 로그인은 되어 있지만 auth 세션이 올바르지 않음

## 해결 방법

### 1. 브라우저 콘솔 확인
웹사이트를 열고 F12를 눌러 개발자 도구를 연 다음, Console 탭에서 다음을 확인하세요:
- `[ProjectStore]` 로그: 프로젝트가 제대로 로드되는지
- `[Dashboard]` 로그: 선택된 프로젝트 정보
- `[fetchTasks]` 로그: 태스크 로딩 상황
- 에러 메시지가 있는지 확인

### 2. Supabase SQL Editor에서 디버그
Supabase 대시보드에서 SQL Editor를 열고 다음 스크립트를 실행하세요:

```sql
-- 1. debug-tasks-issue.sql 실행
-- 이 스크립트는 사용자, 프로필, 프로젝트, 태스크를 모두 확인합니다
```

### 3. profiles 테이블 문제 해결
만약 profiles 테이블에 레코드가 없다면:

```sql
-- 2. fix-existing-users-profiles.sql 실행
-- 이 스크립트는 누락된 profiles 레코드를 생성합니다
```

### 4. 임시 해결책 (즉시 확인)
1. 브라우저에서 로그아웃
2. 캐시 및 쿠키 삭제 (Ctrl+Shift+Delete)
3. 다시 로그인
4. 프로젝트를 다시 선택

### 5. 추가 확인사항
- 프로젝트가 삭제되지 않았는지 확인 (deleted_at이 null이어야 함)
- 태스크가 실제로 생성되었는지 확인
- 다른 브라우저나 시크릿 모드에서 테스트

## 로그 분석 방법

브라우저 콘솔에서 확인해야 할 주요 로그:

1. **사용자 인증 상태**
   ```
   [ProjectStore] Current user: art4onenall@gmail.com <user-id>
   ```

2. **프로젝트 로딩**
   ```
   [ProjectStore] Fetched projects: X projects
   ```

3. **프로젝트 선택**
   ```
   [ProjectList] Selecting project: <project-name> <project-id>
   ```

4. **태스크 로딩**
   ```
   [fetchTasks] Fetching tasks for project: <project-id>
   [fetchTasks] Fetched tasks: X tasks
   ```

이 정보를 확인하여 어느 단계에서 문제가 발생하는지 파악할 수 있습니다.