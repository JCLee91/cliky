-- art4onenall@gmail.com 계정의 태스크 문제 디버깅 SQL

-- 1. 사용자 확인
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
WHERE email = 'art4onenall@gmail.com';

-- 2. 프로필 확인
SELECT * FROM public.profiles
WHERE email = 'art4onenall@gmail.com';

-- 3. 프로젝트 확인
SELECT p.id, p.name, p.created_at, p.status, p.user_id
FROM public.projects p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'art4onenall@gmail.com'
AND p.deleted_at IS NULL
ORDER BY p.created_at DESC;

-- 4. 태스크 확인 (프로젝트별)
SELECT 
    t.id,
    t.title,
    t.project_id,
    p.name as project_name,
    t.created_at
FROM public.tasks t
JOIN public.projects p ON t.project_id = p.id
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'art4onenall@gmail.com'
ORDER BY p.created_at DESC, t.order_index;

-- 5. RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('projects', 'tasks', 'profiles')
ORDER BY tablename, policyname;