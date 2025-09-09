"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Loader2 } from "lucide-react";

import { EventCalendar } from "@/components/ui/event-calendar";
import { GetEventList, CurlingEvent, LOADING_EVENT } from "@/lib/events";
import { EventCard } from "@/components/ui/event-card";

export default function CalendarPage() {
  const [events, setEvents] = useState<CurlingEvent[]>([]);
  const [upcoming, setUpcoming] = useState<CurlingEvent[]>([LOADING_EVENT]);
  const [sideList, setSideList] = useState<CurlingEvent[]>([LOADING_EVENT]);
  const [showingAll, setShowingAll] = useState(false);

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CurlingEvent | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const eventList = await GetEventList();
        setEvents(eventList);

        const upcomingList = await GetEventList(8, {
          upcomingOnly: true,
          sort: "start_time",
        });
        setUpcoming(upcomingList);
        setSideList(upcomingList);
        setShowingAll(false);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleSideList = () => {
    if (showingAll) {
      // Switch back to upcoming
      setSideList(upcoming);
      setShowingAll(false);
    } else {
      // Show full regular events list (all upcoming)
      setSideList(events);
      setShowingAll(true);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Calendar */}
        <div>
          <div
            className="relative h-[600px] rounded-lg overflow-hidden shadow-lg border border-zinc-800 bg-zinc-900/40"
            aria-busy={loading}
          >
            {loading && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-zinc-950/60 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-zinc-300 text-sm" aria-live="polite">
                  <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                  Loading events…
                </div>
              </div>
            )}
            <EventCalendar eventList={events} />
          </div>
        </div>

        {/* Side panel */}
        <aside className="rounded-lg border border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-300">{showingAll ? "All events" : "Upcoming events"}</h2>
            <button
              type="button"
              onClick={toggleSideList}
              className="text-xs text-red-400 hover:text-red-300"
            >
              {showingAll ? "See upcoming" : "See all"}
            </button>
          </div>

          <div className="max-h-[600px] overflow-y-auto divide-y divide-zinc-800">
            {loading ? (
              // Skeleton list
              <div className="p-4 space-y-4 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-zinc-800/70" />
                    <div className="h-3 w-1/2 rounded bg-zinc-800/70" />
                    <div className="h-3 w-2/5 rounded bg-zinc-800/70" />
                  </div>
                ))}
              </div>
            ) : sideList.length > 0 ? (
              sideList.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => setSelected(evt)}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-800/60 focus:bg-zinc-800/60 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-100 line-clamp-1">
                          {evt.title}
                        </span>
                        {evt.type && (
                          <span className="text-[10px] capitalize rounded-full border border-red-600/30 bg-red-600/10 px-1.5 py-0.5 text-red-400">
                            {evt.type}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-zinc-400 flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 text-red-500" />
                        <span>
                          {evt.start
                            ? format(new Date(evt.start), "EEE, MMM d • p")
                            : "TBD"}
                        </span>
                      </div>
                      {evt.location && (
                        <div className="mt-0.5 text-xs text-zinc-500 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-red-500/80" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-sm text-zinc-400">
                {showingAll ? "No future events found." : "No upcoming events found."}
              </div>
            )}
          </div>
        </aside>
      </div>

      <EventCard
        event={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}