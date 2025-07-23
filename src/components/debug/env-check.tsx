'use client'

export function EnvCheck() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Environment Variables Check</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>SUPABASE_URL:</strong> {supabaseUrl ? '✅ Set' : '❌ Missing'}
        </div>
        <div>
          <strong>SUPABASE_ANON_KEY:</strong> {supabaseAnonKey ? '✅ Set' : '❌ Missing'}
        </div>
        {supabaseUrl && (
          <div>
            <strong>URL Value:</strong> {supabaseUrl.substring(0, 30)}...
          </div>
        )}
      </div>
    </div>
  )
}
