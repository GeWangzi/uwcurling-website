// components/event-card.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Event as CalendarEvent } from "react-big-calendar";

interface EventCardProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventCard({ event, isOpen, onClose }: EventCardProps) {
  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[425px]">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            View event information
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input 
              id="title" 
              value={event?.title || ''} 
              className="col-span-3" 
              readOnly
            />
          </div>
          {/* Other fields same as before... */}
        </CardContent>
        <div className="p-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
}