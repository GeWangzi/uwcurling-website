"use client";

import { EventCalendar, CurlingEvent, Transport, Driver } from "@/components/ui/event-calendar";
import { pb } from "@/lib/pocketbase";


async function GetEventList(): Promise<CurlingEvent[]> {
    const eventList: CurlingEvent[] = [];

    const events = await pb.collection('events').getList(1, 50, {
        sort: '+start_time'
    });

    for (let event of events.items) {
        const newEvent: CurlingEvent = {
            title: event.title,
            description: event.description,
            start: event.start_time,
            end: event.end_time,
            type: event.type || 'other',
            location: event.location,
            capacity: event.capacity,
        };

        const newTransport: Transport = {
            self: [],
            drivers: [],
        };

        // Get all drivers for this event (with user expanded)
        const drivers = await pb.collection('drivers').getFullList({
            filter: `event = '${event.id}'`,
            expand: 'user'
        });

        // For each driver, collect their info and passengers
        for (const driver of drivers) {
            const driverUser = driver.expand?.user;
            if (!driverUser) continue;

            const newDriver: Driver = {
                name: driverUser.name,
                time: driver.pickup_time,
                location: driver.pickup_location,
                capacity: driver.capacity,
                passengers: []
            };

            // Get all participants for the driver
            const passengers = await pb.collection('participants').getFullList({
                filter: `driver = '${driver.id}'`,
                expand: 'user'
            });

            for (const passenger of passengers) {
                const passengerUser = passenger.expand?.user;
                if (passengerUser) {
                    newDriver.passengers.push(passengerUser.name);
                }
            }

            newTransport.drivers.push(newDriver);
        }

        // Get participants who are transporting themselves
        const selfDrivers = await pb.collection('participants').getFullList({
            filter: `event = '${event.id}' && driver = null`,
            expand: 'user'
        });

        for (const p of selfDrivers) {
            const user = p.expand?.user;
            if (user) {
                newTransport.self.push(user.name);
            }
        }

        newEvent.transport = newTransport;
        eventList.push(newEvent);
    }

    // console.log(eventList);
    return eventList;
}


export default function Calendar() {
    GetEventList();
    return (
        <div>
            <EventCalendar className=" m-5" />
        </div>
    );
}