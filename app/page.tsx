"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GetEventList, CurlingEvent, LOADING_EVENT } from "@/lib/events";
import { EventCard } from "@/components/ui/event-card";
import {
  Calendar as CalendarIcon,
  MapPin,
  ChevronRight,
  Users,
  Trophy,
  Mail,
  Star,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { IconCurlingRock } from "@/components/CurlingIcon";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const [email, setEmail] = useState("");
  const { user } = useAuth();
  const [events, setEvents] = useState<CurlingEvent[]>([LOADING_EVENT]);
  const [nextOpenHouse, setNextOpenHouse] = useState<CurlingEvent>(LOADING_EVENT);
  const [selected, setSelected] = useState<CurlingEvent | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await GetEventList(3, {
          upcomingOnly: true,
          sort: "start_time",
        });
        setEvents(list || []);
        const openHouseList = await GetEventList(1, {
          types: ["open house"],
          upcomingOnly: true,
          sort: "start_time",
        });
        setNextOpenHouse(openHouseList[0] ?? null);
      } catch (e) {
        console.error("Failed to load events", e);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(197,5,12,0.20),transparent_60%)]"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10 sm:pb-12 lg:pb-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge
                variant="secondary"
                className="bg-zinc-800 text-zinc-100 border-zinc-700"
              >
                Student-run • All skill levels
              </Badge>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
                Good{" "}
                <span className="text-red-500">Curling</span>!
              </h1>
              <p className="mt-4 text-zinc-300 leading-relaxed">
                Learn to curl, compete with friends, and join a community that
                loves good shots and great sportsmanship.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                {user ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-red-600/30 bg-red-600/10 px-3 py-1.5 text-sm text-red-200 shadow-sm">
                    <Sparkles className="h-4 w-4 text-red-400" />
                    <span>
                      Welcome back, <span className="font-semibold text-white">{user.name.split(' ')[0]}</span>!
                    </span>
                  </div>
                ) : (
                  <Button asChild size="lg" className="bg-red-600 text-white hover:bg-red-500">
                    <Link href="/signup">Join the Club</Link>
                  </Button>

                )
                }
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-zinc-700 text-zinc-100 hover:bg-zinc-200"
                >
                  <Link href="#events" className="text-zinc-800">
                    View Events
                    <CalendarIcon className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-zinc-400">
                <span className="inline-flex items-center gap-2">
                  <Trophy className="size-4 text-zinc-500" />
                  2024 + 2025 U.S. College Champions
                </span>
              </div>
            </div>

            <div className="lg:justify-self-start lg:max-w-md w-full">
              {nextOpenHouse ? (
                <Card className="border-zinc-800 bg-zinc-900/50">
                  <CardHeader>
                    <CardTitle className="text-white">Next Open House</CardTitle>
                    {nextOpenHouse.description && (
                      <CardDescription className="text-zinc-400 line-clamp-2">
                        {nextOpenHouse.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <CalendarIcon className="size-4 text-red-500" />
                      <span>
                        {nextOpenHouse.start
                          ? new Date(nextOpenHouse.start).toLocaleString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "TBD"}
                      </span>
                    </div>
                    {nextOpenHouse.location && (
                      <div className="flex items-center gap-2 text-zinc-300">
                        <MapPin className="size-4 text-red-500" />
                        <span>{nextOpenHouse.location}</span>
                      </div>
                    )}
                    <Separator className="bg-zinc-800" />
                  </CardContent>

                  <CardFooter className="flex gap-3">
                    <Button
                      className="bg-red-600 text-white hover:bg-red-500"
                      onClick={() => setSelected(nextOpenHouse)}
                    >
                      Details
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-zinc-700 text-zinc-800 hover:bg-zinc-200"
                    >
                      <Link href="/calendar">Full Calendar</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="border-zinc-800 bg-zinc-900/50">
                  <CardHeader>
                    <CardTitle className="text-white">Next Open House</CardTitle>
                    <CardDescription className="text-zinc-400">
                      No upcoming open house found :(
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="outline" className="border-zinc-700 text-zinc-800 hover:bg-zinc-200q">
                      <Link href="/calendar">Open Calendar</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* === Events === */}
      <section id="events" className="py-16 sm:py-20 bg-zinc-950/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Upcoming Events
              </h2>
              <p className="text-zinc-400 mt-1">
                Practices, learn-to-curls, and competitions.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-zinc-700 text-zinc-800 hover:bg-zinc-200"
            >
              <Link href="/calendar">
                See all
                <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {events.slice(0, 3).map((e) => (
              <Card
                key={e.id}
                className="border-zinc-800 bg-zinc-900/50 flex flex-col"
              >
                <CardHeader className="text-white">
                  <CardTitle className="text-lg">{e.title}</CardTitle>
                  {e.description && (
                    <CardDescription className="text-zinc-400 line-clamp-2">
                      {e.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="text-zinc-300 space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="size-4 text-red-500" />
                    <span>
                      {e.start
                        ? new Date(e.start).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "TBD"}
                    </span>
                  </div>
                  {!!e.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-red-500" />
                      <span>{e.location}</span>
                    </div>
                  )}
                  <Separator className="bg-zinc-800" />
                </CardContent>

                <CardFooter className="mt-auto">
                  <Button
                    className="bg-red-600 hover:bg-red-500"
                    onClick={() => setSelected(e)}
                  >
                    Details
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {events.length === 0 && (
              <div className="col-span-full text-zinc-400">
                No upcoming events—check the{" "}
                <Link href="/calendar" className="text-red-400 hover:text-red-300 underline">
                  calendar
                </Link>
                .
              </div>
            )}
          </div>
        </div>

        <EventCard
          event={selected}
          isOpen={!!selected}
          onClose={() => setSelected(null)}
        />
      </section>


      {/* Join */}
      {/* <section id="join" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-red-500" />
                  <div>
                    <CardTitle className="text-white">Get club updates</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Practice times, events, and signups—straight to your inbox.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form
                  className="flex flex-col sm:flex-row gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    // handle subscription
                    setEmail("");
                  }}
                >
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@wisc.edu"
                    className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                    required
                  />
                  <Button type="submit" className="bg-red-600 text-white hover:bg-red-500">
                    Subscribe
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer id="contact" className="border-t border-zinc-800 bg-zinc-950/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-red-600/10 grid place-items-center">
                  <IconCurlingRock className="size-4 text-red-500" />
                </div>
                <span className="font-semibold tracking-tight">
                  UW–Madison Curling Club
                </span>
              </div>
              <p className="mt-3 text-sm text-zinc-400">
                Have fun and good curling!
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/membership" className="text-zinc-300 hover:text-white">
                    Membership
                  </Link>
                </li>
                <li>
                  <Link href="/sponsors" className="text-zinc-300 hover:text-white">
                    Sponsors
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-3">Contact</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <Mail className="size-4 text-red-500" />
                  <a href="mailto:uwcurling@gmail.com" className="hover:text-white">
                    uwcurling@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="size-4 text-red-500" />
                  <span>Madison Curling Club, McFarland, WI</span>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-6 bg-zinc-800" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
            <p>© {new Date().getFullYear()} CurlingUW</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
