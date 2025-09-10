import { Event as CalendarEvent } from 'react-big-calendar';
import { pb } from './pocketbase';

interface CurlingEvent extends CalendarEvent {
  id: string;
  description: string;
  type: 'practice' | 'matchplay' | 'spiel' | 'championship' | 'open house' | 'other';
  location: string;
  capacity: number;
  transport: Transport;
}

type EventType = CurlingEvent["type"];

export interface EventListOptions {
  types?: EventType[];
  from?: Date;
  to?: Date;
  q?: string;
  location?: string;
  upcomingOnly?: boolean;
  sort?: string;
  page?: number;
}

interface Transport {
  self: string[];
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

export const LOADING_EVENT: CurlingEvent = {
  id: '__loading__',
  title: 'Loading events',
  description: 'Loading...',
  start: new Date(),
  end: new Date(),
  type: 'other',
  location: '',
  capacity: 0,
  transport: { self: [], drivers: [] },
};

// -------- helpers

const esc = (s: string) => s.replace(/'/g, "\\'");
const toPbDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

async function addAttendee(eventId: string, userId: string) {
  const ev = await pb.collection('events').getOne(eventId, { expand: 'attendees' });
  const current: string[] = Array.isArray(ev.attendees) ? ev.attendees.slice() : [];

  if (ev.capacity && ev.capacity > current.length) {
    if (!current.includes(userId) && current.length >= ev.capacity) {
      throw new Error('Event is full');
    }
  }

  if (!current.includes(userId)) {
    current.push(userId);
    await pb.collection('events').update(eventId, { attendees: current });
  }
}

async function removeAttendee(eventId: string, userId: string) {
  const ev = await pb.collection('events').getOne(eventId);
  const current: string[] = Array.isArray(ev.attendees) ? ev.attendees.slice() : [];
  const next = current.filter(id => id !== userId);
  if (next.length !== current.length) {
    await pb.collection('events').update(eventId, { attendees: next });
  }
}

async function addPassenger(driverId: string, userId: string) {
  const drv = await pb.collection('drivers').getOne(driverId);
  const current: string[] = Array.isArray(drv.passengers) ? drv.passengers.slice() : [];
  if (drv.capacity && drv.capacity > drv.passengers.length) {
    if (!current.includes(userId)) {
      current.push(userId);
      await pb.collection('drivers').update(driverId, { passengers: current });
    }
  }
}

async function removePassengerIfAny(eventId: string, userId: string) {
  const drivers = await pb.collection('drivers').getFullList({
    filter: `event = '${eventId}'`,
  });
  for (const drv of drivers) {
    const current: string[] = Array.isArray(drv.passengers) ? drv.passengers : [];
    if (current.includes(userId)) {
      const next = current.filter(id => id !== userId);
      await pb.collection('drivers').update(drv.id, { passengers: next });
      break;
    }
  }
}

// -------- main API

async function GetEventList(
  numEvents: number = 50,
  opts: EventListOptions = {}
): Promise<CurlingEvent[]> {
  const {
    types,
    from,
    to,
    q,
    location,
    upcomingOnly,
    sort,
    page = 1,
  } = opts;

  const filterParts: string[] = [];

  if (types?.length) {
    filterParts.push(
      "(" + types.map((t) => `type = '${esc(t)}'`).join(" || ") + ")"
    );
  }

  const fromDate = from ?? (upcomingOnly ? new Date() : undefined);
  if (fromDate) filterParts.push(`start_time >= '${toPbDateTime(fromDate)}'`);
  if (to) filterParts.push(`start_time <= '${toPbDateTime(to)}'`);

  if (q && q.trim()) {
    const term = esc(q.trim());
    filterParts.push(`(title ~ '${term}' || description ~ '${term}')`);
  }

  if (location && location.trim()) {
    filterParts.push(`(location ~ '${esc(location.trim())}')`);
  }

  const filter = filterParts.join(" && ");

  // Expand attendees for names later
  const events = await pb.collection("events").getList(page, numEvents, {
    sort: sort ?? "-start_time",
    ...(filter && { filter }),
    expand: "attendees",
  });

  const eventList: CurlingEvent[] = [];

  for (const event of events.items) {
    // Get drivers for this event; expand user and passengers to compute transport mapping
    const drivers = await pb.collection("drivers").getFullList({
      filter: `event = '${event.id}'`,
      expand: "user,passengers",
    });

    // Build a set of passenger userIds to separate self attendees
    const passengerIds = new Set<string>();
    const driverViews: Driver[] = [];

    for (const driver of drivers) {
      const driverUser = driver.expand?.user;
      const passengerUsers: any[] = Array.isArray(driver.expand?.passengers) ? driver.expand.passengers : [];
      const passengerNames: string[] = [];

      for (const p of passengerUsers) {
        if (p?.id) {
          passengerIds.add(p.id);
          passengerNames.push(p.name ?? p.email ?? 'Unknown');
        }
      }

      driverViews.push({
        id: driver.id,
        name: driverUser?.name ?? driverUser?.email ?? 'Driver',
        time: driver.pickup_time,
        location: driver.pickup_location,
        capacity: driver.capacity,
        passengers: passengerNames,
      });
    }

    // attendees (expanded) minus passengers -> self
    const attendeeUsers: any[] = Array.isArray(event.expand?.attendees) ? event.expand.attendees : [];
    const selfNames: string[] = attendeeUsers
      .filter(u => u?.id && !passengerIds.has(u.id))
      .map(u => u.name ?? u.email ?? 'Unknown');

    const newEvent: CurlingEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      start: event.start_time,
      end: event.end_time,
      type: event.type || "other",
      location: event.location,
      capacity: event.capacity,
      transport: {
        self: selfNames,
        drivers: driverViews,
      },
    };

    eventList.push(newEvent);
  }

  return eventList;
}

async function IsRegisteredFor(eventId: string) {
  if (!pb.authStore.isValid) throw new Error('Not authenticated');

  const userId = pb.authStore.record?.id;
  if (!userId) throw new Error('User not found');

  try {
    const ev = await pb.collection('events').getOne(eventId);
    const attendees: string[] = Array.isArray(ev.attendees) ? ev.attendees : [];
    return attendees.includes(userId);
  } catch {
    return false;
  }
}

async function RegisterForEvent(eventId: string, driverInfo: Driver | string | null) {
  if (!pb.authStore.isValid) throw new Error('Not authenticated');

  const userId = pb.authStore.record?.id;
  if (!userId) throw new Error('User not found');

  await addAttendee(eventId, userId);

  if (!driverInfo) {
    // nothing else to do
    return true;
  }

  // Join existing driver
  if (typeof driverInfo === 'string') {
    await addPassenger(driverInfo, userId);
    return true;
  }

  const driver = await pb.collection('drivers').create({
    event: eventId,
    user: userId,
    pickup_time: driverInfo.time,
    pickup_location: driverInfo.location,
    capacity: driverInfo.capacity,
    passengers: [userId],
  });

  return !!driver?.id;
}

async function UnregisterForEvent(eventId: string) {
  if (!pb.authStore.isValid) throw new Error('Not authenticated');

  const userId = pb.authStore.record?.id;
  if (!userId) throw new Error('User not found');

  // 1) Remove from any driver's passengers (if currently riding)
  await removePassengerIfAny(eventId, userId);

  // 2) If the user is a driver, delete the driver record.
  //    We keep their former passengers as attendees (they’ll appear under "self").
  try {
    const driverRecord = await pb.collection('drivers').getFirstListItem(
      `event = "${eventId}" && user = "${userId}"`
    );
    if (driverRecord?.id) {
      await pb.collection('drivers').delete(driverRecord.id);
    }
  } catch {
    // not a driver — ignore
  }

  // 3) Finally, remove from event.attendees
  await removeAttendee(eventId, userId);

  return true;
}

export { GetEventList, IsRegisteredFor, RegisterForEvent, UnregisterForEvent };
export type { CurlingEvent, Transport, Driver };
