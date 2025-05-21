"use client";

import { EventCalendar } from "@/components/ui/event-calendar";
import { pb } from "@/lib/pocketbase";


export default function Calendar() {
    // const resultList = await pb.collection('drivers').getList(1, 50, {
    //     filter: 'someField1 != someField2',
    // });
    return (
        <div>
            <EventCalendar className=" m-5" />
        </div>
    );
}