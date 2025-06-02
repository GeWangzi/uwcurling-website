import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CurlingEvent, RegisterForEvent, UnregisterForEvent, IsRegisteredFor } from "@/lib/events";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface EventCardProps {
  event: CurlingEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventCard({ event, isOpen, onClose }: EventCardProps) {
  const [isDriver, setIsDriver] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      if (!event) return;
      try {
        const registered = await IsRegisteredFor(event.id);
        setIsRegistered(registered);
      } catch (err) {
        console.error("Failed to check registration:", err);
      }
    };

    checkRegistration();
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isDriver) {
        const driverInfo = {
          name: "lorem ipusm",
          time: new Date(),
          location: pickupLocation,
          capacity: capacity,
          passengers: []
        };
        await RegisterForEvent(event.id, driverInfo);
      } else {
        await RegisterForEvent(event.id, selectedDriver);
      }
      alert("Successfully registered!");
      setIsRegistered(true);
    } catch (err) {
      console.error(err);
      alert("Registration failed.");
    }
  };

  const handleUnregister = async () => {
    try {
      // You'll need to implement UnregisterForEvent
      await UnregisterForEvent(event.id);
      alert("Successfully unregistered.");
      setIsRegistered(false);
    } catch (err) {
      console.error(err);
      alert("Unregistration failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[425px] relative mx-4">
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <div className="h-5 px-2 text-xs flex items-center text-white rounded-full bg-rose-500">
              {event.type}
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-1">
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
            {event.start &&
              new Date(event.start).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
          </div>
          <CardDescription className="mt-1">{event.description}</CardDescription>
        </CardHeader>

        <CardContent className="px-6">
          {isRegistered ? (
            <>
              {/* Transport Info */}
              <div className="space-y-2">
                {event.transport?.drivers.map((driver, driverId) => (
                  <div key={driverId}>
                    <Label className="font-medium block mb-1">
                      {driver.name} ({driver.passengers.length} passenger
                      {driver.passengers.length !== 1 ? "s" : ""})
                    </Label>
                    <ul className="text-sm ml-4 list-disc">
                      {driver.passengers.map((passenger, passengerId) => (
                        <li key={passengerId}>{passenger}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {event.transport?.self.length > 0 && (
                  <div>
                    <Label className="font-medium block mb-1">Also coming:</Label>
                    <ul className="text-sm ml-4 list-disc">
                      {event.transport.self.map((participant, index) => (
                        <li key={index}>{participant}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="driver"
                    checked={isDriver}
                    onCheckedChange={(checked) => setIsDriver(!!checked)}
                  />
                  <Label htmlFor="driver">I want to be a driver</Label>
                </div>

                {isDriver ? (
                  <div className="space-y-2">
                    <Label htmlFor="location">Pickup Location</Label>
                    <Input
                      id="location"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Location"
                      required
                    />
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="pickup">Pickup Location</Label>
                    <Select onValueChange={(value) => setSelectedDriver(value)}>
                      <SelectTrigger id="pickup">
                        <SelectValue placeholder="Select pickup location" />
                      </SelectTrigger>
                      <SelectContent>
                        {event.transport?.drivers.map((driver, id) => (
                          <SelectItem key={id} value={driver.name}>
                            {driver.location} (Driver: {driver.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Register
                </Button>
              </form>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            size="sm"
            className="bg-red-500 hover:bg-red-600"
            onClick={onClose}
          >
            Quit
          </Button>
          {isRegistered && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleUnregister}
            >
              Unregister
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
