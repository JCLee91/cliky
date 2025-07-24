-- 기존 사용자들의 profiles 레코드 생성 (없는 경우에만)
-- profiles 테이블이 생성되기 전에 가입한 사용자들을 위한 스크립트

-- 1. profiles 테이블에 없는 사용자들 확인
SELECT u.id, u.email, u.created_at, u.raw_user_meta_data
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 2. 누락된 사용자들의 profiles 생성
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 3. 생성 결과 확인
SELECT COUNT(*) as total_users FROM auth.users;
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 4. art4onenall@gmail.com 계정 상태 확인
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.full_name,
  p.avatar_url,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'art4onenall@gmail.com';