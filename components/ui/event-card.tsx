// components/event-card.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CurlingEvent } from "@/lib/events";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface EventCardProps {
  event: CurlingEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventCard({ event, isOpen, onClose }: EventCardProps) {
  if (!isOpen || !event) return null;

  const pickupLocations = event.transport?.drivers.map((driver, id) => (
    <SelectItem key={id} value={driver.location}>
      {driver.location}
    </SelectItem>
  ));

  const selectPickup = (
    <div className="space-y-2">
      <Label htmlFor="pickup">Pickup Location</Label>
      <Select>
        <SelectTrigger id="pickup">
          <SelectValue placeholder="Select pickup location" />
        </SelectTrigger>
        <SelectContent>
          {pickupLocations}
        </SelectContent>
      </Select>
    </div>
  );

  const transportInfo = event.transport?.drivers.map((driver, driverId) => (
    <div key={driverId}>
      <Label className="font-medium block mb-2">{driver.name} ({driver.passengers.length} passenger{driver.passengers.length != 1 ? 's' : ''})</Label>
      <ul className="text-sm">
        {driver.passengers.map((passenger, passengerId) => (
          <li key={passengerId}>{passenger}</li>
        ))}
      </ul>
    </div>
  ));


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[425px] relative mx-4">
        <CardHeader className="relative">
          <div className="items-start">
            <div className="flex justify-between">
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <div className="h-5 pl-2 pr-2 pt-0 pb-0 text-xs flex items-center text-white rounded-full bg-rose-500">{event.type}</div>

            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {event.start && (
                new Date(event.start).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              )}
            </div>
            <CardDescription className="mt-1">{event.description}</CardDescription>
          </div>


        </CardHeader>
        <CardContent className="grid gap-4 px-6">
          <div className="">
            {selectPickup}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="pt-0">
            <Button className="w-full" onClick={onClose}>
              Register
            </Button>
          </div>
          <Button size="sm" className="bg-red-500 hover:bg-red-600" onClick={onClose} >
            Quit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}