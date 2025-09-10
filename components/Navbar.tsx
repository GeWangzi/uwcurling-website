'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from './ui/button'
import { useAuth } from './AuthProvider'
import { IconCurlingRock } from './CurlingIcon'
import {
  Calendar as CalendarIcon,
  ChevronRight,
  LogInIcon,
  LogOutIcon,
  Crown,
  Loader2,
  Menu,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const isMember = Boolean(user?.membership)
  const isMembershipPending = !isMember && Boolean(user?.membershipPending)

  const initial =
    (user?.name?.trim()?.[0] || user?.email?.trim()?.[0] || '?').toUpperCase()

  const NavLinks = () => (
    <>
      <Link href="/#events" className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white">
        Events
      </Link>
      <Link href="/#contact" className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white">
        Contact
      </Link>
      <Link href="/calendar" className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-red-400">
        <CalendarIcon className="size-4" />
        Calendar
      </Link>
      {!isMember && !isMembershipPending && (
        <Link href="/membership" className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-red-400">
          <Crown className="size-4" />
          Membership
        </Link>
      )}
    </>
  )

  return (
    <nav className="sticky top-0 z-50">
      <header className="sticky top-0 z-50 border-b border-zinc-800 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 grid grid-cols-[auto_1fr_auto] items-center text-zinc-100">
          {/* Left: Logo */}
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

          {/* Center: Desktop nav */}
          <nav className="hidden md:flex items-center justify-center gap-6 text-sm">
            <NavLinks />
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 justify-self-end">
            {/* Mobile: Hamburger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9 text-zinc-200 hover:text-white"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[88vw] sm:w-80 border-l border-zinc-800 bg-zinc-900 text-zinc-100 p-0"
              >
                <SheetHeader className="px-4 pb-3 pt-4 border-b border-zinc-800">
                  <SheetTitle className="flex items-center gap-2 text-sm text-zinc-100">
                    <div className="size-7 rounded-md bg-red-600/10 grid place-items-center">
                      <IconCurlingRock className="h-4 w-4 text-red-500" />
                    </div>
                    UW–Madison Curling Club
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile links */}
                <div className="p-2">
                  <ul className="flex flex-col">
                    <li>
                      <Link
                        href="/#events"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 text-zinc-300 hover:bg-zinc-800/60 rounded-md"
                      >
                        Events
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/#contact"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 text-zinc-300 hover:bg-zinc-800/60 rounded-md"
                      >
                        Contact
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/calendar"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 text-zinc-300 hover:bg-zinc-800/60 rounded-md"
                      >
                        <span className="inline-flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-red-500" />
                          Calendar
                        </span>
                      </Link>
                    </li>

                    {!isMember && !isMembershipPending && (
                      <li>
                        <Link
                          href="/membership"
                          onClick={() => setOpen(false)}
                          className="block px-4 py-3 text-zinc-300 hover:bg-zinc-800/60 rounded-md"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Crown className="h-4 w-4 text-red-500" />
                            Membership
                          </span>
                        </Link>
                      </li>
                    )}
                  </ul>

                  {/* Membership status / CTA */}
                  <div className="px-4 pt-2">
                    {user ? (
                      isMembershipPending ? (
                        <div className="mt-2 flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Membership In Review
                          </span>
                          <span className="rounded-full border border-amber-500/40 px-2 py-0.5">
                            Pending
                          </span>
                        </div>
                      ) : isMember ? (
                        <div className="mt-2 flex items-center justify-between rounded-md border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-400">
                          <span className="inline-flex items-center gap-2">
                            <Crown className="h-3.5 w-3.5" />
                            Club Member
                          </span>
                          <span className="rounded-full border border-red-600/40 px-2 py-0.5">
                            Active
                          </span>
                        </div>
                      ) : (
                        <Link
                          href="/membership"
                          onClick={() => setOpen(false)}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                        >
                          Become a Member
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      )
                    ) : null}
                  </div>

                  {/* Auth section */}
                  <div className="px-4 py-4 border-t border-zinc-800 mt-2">
                    {!user ? (
                      <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                      >
                        <LogInIcon className="h-4 w-4" />
                        Login / Sign up
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setOpen(false)
                          logout()
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
                      >
                        <LogOutIcon className="h-4 w-4" />
                        Log out
                      </button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop: Login or Avatar menu */}
            {!user ? (
              <Link href="/login" className="hidden md:inline-block">
                <Button className="h-9 px-3 bg-red-600 hover:bg-red-500">
                  <LogInIcon className="mr-2 size-4" />
                  Login / Sign up
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:inline-flex h-9 w-9 rounded-full p-0 ring-1 ring-inset ring-red-600/30"
                    aria-label="Account menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={(user as any)?.avatarUrl || ''}
                        alt={user?.name || 'User'}
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
                    {user?.name || user?.email || 'Account'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />

                  {isMembershipPending ? (
                    <DropdownMenuItem className="pointer-events-none">
                      <div className="flex w-full items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-amber-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Membership In Review
                        </span>
                        <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                          Pending
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ) : !isMember ? (
                    <DropdownMenuItem asChild className="focus:bg-zinc-800 focus:text-white">
                      <Link href="/membership" className="flex w-full items-center justify-between">
                        <span>Become a Member</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem className="pointer-events-none">
                      <div className="flex w-full items-center justify-between">
                        <span className="inline-flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Club Member
                        </span>
                        <span className="inline-flex items-center rounded-full border border-red-600/30 bg-red-600/15 px-2 py-0.5 text-xs font-medium text-red-400">
                          Active
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-400 focus:bg-zinc-800"
                    onClick={(e) => {
                      e.preventDefault()
                      logout()
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
