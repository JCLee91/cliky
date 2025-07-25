import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">404 - 페이지를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-6">
          요청하신 페이지가 존재하지 않습니다.
        </p>
        <Button asChild>
          <Link href="/login">
            로그인으로 이동
          </Link>
        </Button>
      </div>
    </div>
  )
}