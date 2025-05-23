import {Event as CalendarEvent} from 'react-big-calendar';
import { pb } from "@/lib/pocketbase";

interface CurlingEvent extends CalendarEvent {
    description?: string | undefined;
    type?: 'practice' | 'matchplay' | 'spiel' | 'championship' | 'other' | undefined;
    location?: string | undefined;
    capacity?: number | undefined;
    transport?: Transport | undefined;
}

interface Transport {
  self: string[]; // people not riding with any driver
  drivers: Driver[];
}

interface Driver {
    name: string
    time: Date
    location: string
    capacity: number
    passengers: string[]
}

async function GetEventList(): Promise<CurlingEvent[]> {
    const eventList: CurlingEvent[] = [];

    const events = await pb.collection('events').getList(1, 50, {
        sort: '-start_time'
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

async function RegisterForEvent(userId:string, eventId:string, driverId:string = '') {
    const data = {
        "event": eventId,
        "user": userId,
        "driver": driverId || null,
    }
    const record = await pb.collection('participants').create(data);
}

async function RegisterForEventDriver(userId:string, eventId:string, driver:Driver) {

}

export { GetEventList }
export type { CurlingEvent, Transport, Driver};
