import { Calendar, Event as CalendarEvent, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { useState } from 'react';
import { EventCard } from './event-card';
import { CurlingEvent } from '@/lib/events';
// Custom header component


interface CalendarProps extends React.ComponentProps<"div"> {
  eventList: CalendarEvent[];
}

interface HeaderProps {
  label: string;
  onNavigate: (direction: 'PREV' | 'NEXT' | 'TODAY') => void;
  view: string;
}

interface ToolbarProps {
  label: string;
  onNavigate: HeaderProps['onNavigate'];
  view: string;
}

const CustomHeader = ({ label, onNavigate, view }: HeaderProps) => {
    return (
        <div className="flex items-center justify-center mb-2">
            <button
                onClick={() => onNavigate('PREV')}
                className="p-2 rounded hover:bg-gray-100"
            >
                &lt;
            </button>
            <div className="text-lg font-semibold">{label}</div>
            <button
                onClick={() => onNavigate('NEXT')}
                className="p-2 rounded hover:bg-gray-100"
            >
                &gt;
            </button>
        </div>
    );
};

// Custom toolbar to hide the default view switcher
const CustomToolbar = (toolbar: ToolbarProps) => {
    return (
        <div>
            <CustomHeader
                label={toolbar.label}
                onNavigate={toolbar.onNavigate}
                view={toolbar.view}
            />
        </div>
    );
};

// Custom event component to show times
const Event = ({ event }: { event: any }) => {
    const formatTime = (date: Date) => {
        return moment(date).format('h:mm a');
    };

    return (
        <div className="p-1">
            <strong>{event.title}</strong>
            <div className="text-xs">
                {formatTime(event.start)} - {formatTime(event.end)}
            </div>
        </div>
    );
};

function EventCalendar({ className, eventList, ...props }: CalendarProps) {
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent|null>(null);
    const [isCardOpen, setIsCardOpen] = useState(false);

    const localizer = momentLocalizer(moment);

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsCardOpen(true);
    };

    const closeEvent = () => {
        setIsCardOpen(false);
    }

    return (
        <div className="h-[600px]">
            <Calendar
                localizer={localizer}
                events={eventList}
                startAccessor="start"
                endAccessor="end"
                components={{
                    event: Event,
                    toolbar: CustomToolbar,
                }}
                formats={{
                    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                        `${localizer?.format(start, 'h:mm a', culture)} - ${localizer?.format(end, 'h:mm a', culture)}`,
                }}
                views={['month']}
                onSelectEvent={handleEventClick}
            />
            <EventCard
                event={selectedEvent}
                isOpen={isCardOpen}
                onClose={closeEvent}
            />
        </div>
    );
}

export { EventCalendar };
