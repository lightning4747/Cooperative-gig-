import { Outlet, Link, useLocation } from 'react-router-dom'

export function AuthLayout() {
  const location = useLocation()
  const isRegisterPage = location.pathname.startsWith('/register')

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 antialiased">
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-3">
        <Link to="/login" className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Cooperative Gig Services Platform
          </span>
        </Link>
      </header>

      {/* Main Centered Authentication Scaffold */}
      <main className="w-full flex-1 flex items-center justify-center py-4 sm:py-6">
        <div className={isRegisterPage ? 'w-full max-w-2xl' : 'w-full max-w-md'}>
          <Outlet />
        </div>
      </main>

      {/* Clean Empty Footer Spacer */}
      <footer className="w-full max-w-4xl mx-auto py-2" />
    </div>
  )
}
