"use client";

import { EventCalendar } from "@/components/ui/event-calendar";
import { useEffect, useState } from "react";
import { GetEventList, CurlingEvent, Transport, Driver } from "@/lib/events";


export default function CalendarPage() {
    const [events, setEvents] = useState<CurlingEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEvents() {
            try {
                const eventList = await GetEventList();
                setEvents(eventList);
            } catch (error) {
                console.error("Failed to load events:", error);
            } finally {
                setLoading(false);
            }
        }
        loadEvents();
    }, []);


    return (
        <div className={loading ? 'opacity-50 p-8' : 'p-8'}>
            <div className="h-[600px] rounded-lg overflow-hidden shadow-lg border-2">
                <EventCalendar eventList={events} />
            </div>
        </div>
    );
}
