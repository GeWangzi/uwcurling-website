import { Event as CalendarEvent } from 'react-big-calendar';
import { pb } from './pocketbase';

interface CurlingEvent extends CalendarEvent {
    id: string;
    description: string;
    type: 'practice' | 'matchplay' | 'spiel' | 'championship' | 'other';
    location: string;
    capacity: number;
    transport: Transport;
}

interface Transport {
    self: string[]; // people not riding with any driver
    drivers: Driver[];
}

interface Driver {
    id: string
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
                id: driver.id,
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

        const newEvent: CurlingEvent = {
            id: event.id,
            title: event.title,
            description: event.description,
            start: event.start_time,
            end: event.end_time,
            type: event.type || 'other',
            location: event.location,
            capacity: event.capacity,
            transport: newTransport,
        };
        eventList.push(newEvent);
    }

    // console.log(eventList);
    return eventList;
}

async function IsRegisteredFor(eventId: string) {
    if (!pb.authStore.isValid) {
        throw new Error('Not authenticated');
    }

    const userId = pb.authStore.record?.id;
    if (!userId) {
        throw new Error('User not found');
    }
    try {
        const record = await pb.collection('participants').getFirstListItem(
            `event = "${eventId}" && user = "${userId}"`
        );

        if (record) return true;
        else return false;
    } catch (err) {
        return false;
    }
}


async function RegisterForEvent(eventId: string, driverInfo: Driver | string | null) {
    try {
        if (!pb.authStore.isValid) {
            throw new Error('Not authenticated');
        }

        const userId = pb.authStore.record?.id;
        if (!userId) {
            throw new Error('User not found');
        }

        // check event capacity
        const event = await pb.collection('events').getOne(eventId);
        if (event.capacity) {
            const participants = await pb.collection('participants').getFullList({
                filter: `event = "${eventId}"`
            });
            console.log("participants length: " + participants.length);
            if (participants.length >= event.capacity) {
                throw new Error('Event is full');
            }
        }
        console.log("driverinfo " + driverInfo);

        if (!driverInfo) {
            console.log("registering as participant for self-trasnport");
            await pb.collection('participants').create({
                event: eventId,
                user: userId,
            })
        }
        else if (typeof driverInfo === 'string') {
            // register as participant with existing driver
            console.log("registering as participant with driver " + driverInfo);
            await pb.collection('participants').create({
                event: eventId,
                user: userId,
                driver: driverInfo // driver id
            });
        } else {
            // register as new driver
            console.log("registring as driver");
            const driver = await pb.collection('drivers').create({
                event: eventId,
                user: userId,
                pickup_time: driverInfo.time,
                pickup_location: driverInfo.location,
                capacity: driverInfo.capacity
            });

            // Register self as first passenger
            await pb.collection('participants').create({
                event: eventId,
                user: userId,
                driver: driver.id
            });
        }

        return true;
    } catch (err) {
        console.error('Registration failed:', err);
        throw err;
    }
}

async function UnregisterForEvent(eventId: string) {
    try {
        if (!pb.authStore.isValid) {
            throw new Error('Not authenticated');
        }

        const userId = pb.authStore.record?.id;
        if (!userId) {
            throw new Error('User not found');
        }

        console.log("Looking for participant record to unregister");
        const participantRecord = await pb.collection('participants').getFirstListItem(
            `event = "${eventId}" && user = "${userId}"`
        );
        console.log("performing unregister for participant", participantRecord.id);
        await pb.collection('participants').delete(participantRecord.id);



        // if user was a driver, remove the driver record and any associated passengers
        try {
            const driverRecord = await pb.collection('drivers').getFirstListItem(
                `event = "${eventId}" && user = "${userId}"`
            );
            const driverId = driverRecord.id;

            const passengerRecords = await pb.collection('participants').getFullList({
                filter: `driver = "${driverId}"`
            });

            for (const passenger of passengerRecords) {
                await pb.collection('participants').delete(passenger.id);
            }

            await pb.collection('drivers').delete(driverId);
        } catch (err) {
            console.log("Not a driver");
        }
        

        return true;
    } catch (err) {
        console.error('Unregister failed:', err);
        throw err;
    }
}

export { GetEventList, IsRegisteredFor, RegisterForEvent, UnregisterForEvent }
export type { CurlingEvent, Transport, Driver };
