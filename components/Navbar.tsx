'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'
import { useAuth } from './AuthProvider'
import { IconCurlingRock } from './CurlingIcon'
import {
  CalendarIcon,
  ChevronRight,
  LogInIcon,
  LogOutIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";


export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Calendar', href: '/calendar' },
  ]

  const isMember = Boolean(user?.membership)
  const joinHref = pathname === '/' ? '#join' : '/#join'
  const initial =
    (user?.name?.trim()?.[0] ||
      user?.email?.trim()?.[0] ||
      '?'
    ).toUpperCase()

  return (
    <nav className="sticky top-0 z-50">
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/50 border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-white">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-md"
          >
            <div className="size-8 rounded-lg bg-red-600/10 grid place-items-center">
              <IconCurlingRock className="h-5 w-5 text-red-500" />
            </div>
            <span className="font-semibold tracking-tight">
              UW–Madison Curling Club
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/#events" className="text-zinc-300 hover:text-white">
              Events
            </Link>
            <Link href="/#contact" className="text-zinc-300 hover:text-white">
              Contact
            </Link>
            <Button
              asChild
              variant="ghost"
              className="hidden sm:inline-flex hover:text-red-400"
            >
              <Link href="/calendar">
                <CalendarIcon className="mr-2 size-4" />
                Calendar
              </Link>
            </Button>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {!user ? (
              <Link href="/login">
                <Button className="bg-red-600 hover:bg-red-500">
                  <LogInIcon className="mr-2 size-4" />
                  Login / Sign up
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 w-9 rounded-full p-0 ring-1 ring-inset ring-red-600/30"
                    aria-label="Account menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={(user as any)?.avatarUrl || ""}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback className="bg-red-600/20 text-red-400">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100"
                >
                  <DropdownMenuLabel className="text-zinc-300">
                    {user?.name || user?.email || "Account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />

                  {/* Only show Become a Member if not a member */}
                  {!isMember && (
                    <DropdownMenuItem asChild className="focus:bg-zinc-800">
                      <Link href={joinHref} className="flex w-full items-center justify-between">
                        <span>Become a Member</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-zinc-800" />

                  <DropdownMenuItem
                    className="text-red-400 focus:bg-zinc-800"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
    </nav>
  )
}
