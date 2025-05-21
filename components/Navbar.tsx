'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'
import { useAuth } from './AuthProvider'
export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Calendar', href: '/calendar' },
  ]

  return (
    <nav className="border-b sticky top-0 bg-white z-10">
      <div className="max-w-6xl mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg">
            UW Curling
          </Link>
          
          <div className="hidden md:flex gap-6">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`${pathname === link.href ? 'text-red-500 font-medium' : 'text-gray-600 hover:text-red-500'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Auth Button */}
        <div>
          {user ? (
            <Button 
              variant="outline" 
              onClick={() => logout()}
              className="px-4"
            >
              Logout
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="default" className="px-4">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}