import { Calendar, Event as CalendarEvent, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { useMemo } from 'react';
import { CurlingEvent } from '@/lib/events';

interface CalendarProps extends React.ComponentProps<'div'> {
  eventList: CurlingEvent[];
  onSelectEvent?: (event: CurlingEvent) => void;
}

interface HeaderProps {
  label: string;
  onNavigate: (direction: 'PREV' | 'NEXT' | 'TODAY') => void;
  view: string;
}

const CustomHeader = ({ label, onNavigate }: HeaderProps) => (
  <div className="flex items-center justify-center mb-2">
    <button onClick={() => onNavigate('PREV')} className="p-2 rounded hover:bg-zinc-800">
      &lt;
    </button>
    <div className="text-lg font-semibold">{label}</div>
    <button onClick={() => onNavigate('NEXT')} className="p-2 rounded hover:bg-zinc-800">
      &gt;
    </button>
  </div>
);

// react-big-calendar calls this with its toolbar props,
// but we only need label + onNavigate here.
const CustomToolbar = (toolbar: any) => (
  <div>
    <CustomHeader label={toolbar.label} onNavigate={toolbar.onNavigate} view={toolbar.view} />
  </div>
);

// Custom event renderer with times
const Event = ({ event }: { event: CurlingEvent }) => {
  const formatTime = (date: Date) => moment(date).format('h:mm a');
  return (
    <div className="p-1">
      <strong className="block truncate">{event.title}</strong>
      <div className="text-xs">
        {formatTime(event.start as Date)} - {formatTime(event.end as Date)}
      </div>
    </div>
  );
};

function EventCalendar({ className, eventList, onSelectEvent, ...props }: CalendarProps) {
  const localizer = useMemo(() => momentLocalizer(moment), []);

  const handleSelect = (event: CalendarEvent) => {
    onSelectEvent?.(event as CurlingEvent);
  };

  return (
    <div className={`h-[600px] ${className ?? ''}`} {...props}>
      <Calendar
        localizer={localizer}
        events={eventList}
        startAccessor="start"
        endAccessor="end"
        components={{ event: Event as any, toolbar: CustomToolbar }}
        formats={{
          eventTimeRangeFormat: ({ start, end }, culture, loc) =>
            `${loc?.format(start, 'h:mm a', culture)} - ${loc?.format(end, 'h:mm a', culture)}`,
        }}
        views={['month']}
        onSelectEvent={handleSelect}
      />
    </div>
  );
}

export { EventCalendar };
