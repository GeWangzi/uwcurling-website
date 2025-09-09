import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  CurlingEvent,
  Driver,
  RegisterForEvent,
  UnregisterForEvent,
  IsRegisteredFor,
} from "@/lib/events";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "../AuthProvider";
import { Calendar as DatePicker } from "@/components/ui/calendar";
import { Clock2Icon, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface EventCardProps {
  event: CurlingEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventCard({ event, isOpen, onClose }: EventCardProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [isDriver, setIsDriver] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [pickupDate, setPickupDate] = useState<Date | undefined>(new Date());
  const [pickupTime, setPickupTime] = useState("10:30:00");

  // Only check registration if user is signed in
  useEffect(() => {
    if (!event || !user) return;
    (async () => {
      try {
        const registered = await IsRegisteredFor(event.id);
        setIsRegistered(registered);
      } catch (err) {
        console.error("Failed to check registration:", err);
      }
    })();
  }, [event, user]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    let pickupDateTime: Date | null = null;
    if (pickupDate && pickupTime) {
      const [hours, minutes, seconds] = pickupTime.split(":").map(Number);
      pickupDateTime = new Date(pickupDate);
      pickupDateTime.setHours(hours, minutes, seconds || 0, 0);
    }
    try {
      if (isDriver) {
        const driverInfo: Driver = {
          id: user?.id || "",
          name: user?.name || "",
          time: pickupDateTime || new Date(),
          location: pickupLocation,
          capacity,
          passengers: [],
        };
        await RegisterForEvent(event.id, driverInfo);
      } else {
        await RegisterForEvent(event.id, selectedDriver);
      }
      setIsRegistered(true);
    } catch (err) {
      console.error(err);
      console.log("Registration failed.");
    }
  };

  const handleUnregister = async () => {
    if (!user) return;
    try {
      await UnregisterForEvent(event.id);
      setIsRegistered(false);
    } catch (err) {
      console.error(err);
      console.log("Unregistration failed.");
    }
  };

  const loginToRegister = () => {
    // Optionally preserve return path:
    // const next = typeof window !== "undefined" ? window.location.pathname : "/";
    // router.push(`/login?next=${encodeURIComponent(next)}`);
    router.push("/login");
  };

  const formattedStart =
    event.start ? format(new Date(event.start), "EEE, MMM d, yyyy • p") : null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <Card
        className="relative w-[min(92vw,480px)] border-zinc-800 bg-zinc-900/50 text-zinc-100 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-xl tracking-tight">{event.title}</CardTitle>
            {event.type && (
              <span className="shrink-0 h-5 px-2 text-xs inline-flex items-center rounded-full bg-red-600 text-white">
                {event.type}
              </span>
            )}
          </div>
          {event.description && (
            <CardDescription className="text-zinc-400 mt-1">
              {event.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-300">
            <CalendarIcon className="size-4 text-red-500" />
            <span>{formattedStart ?? "TBD"}</span>
          </div>
          {!!event.location && (
            <div className="flex items-center gap-2 text-zinc-300">
              <MapPin className="size-4 text-red-500" />
              <span>{event.location}</span>
            </div>
          )}

          <Separator className="bg-zinc-800" />

          {!user ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">
                Log in to register and view ride options.
              </p>
              <Button
                onClick={loginToRegister}
                className="w-full bg-red-600 text-white hover:bg-red-500"
              >
                Login to register
              </Button>
            </div>
          ) : isRegistered ? (
            // Signed in + already registered
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">Your ride & attendees</p>
              <div className="space-y-3">
                {event.transport?.drivers.map((driver, driverId) => (
                  <div key={driverId} className="rounded-lg border border-zinc-800 p-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium text-zinc-200">{driver.name}</Label>
                      <span className="text-xs text-zinc-400">
                        {driver.passengers.length} passenger
                        {driver.passengers.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {driver.passengers.length > 0 && (
                      <ul className="text-sm text-zinc-300 mt-2 list-disc ml-5">
                        {driver.passengers.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {event.transport?.self?.length ? (
                  <div className="rounded-lg border border-zinc-800 p-3">
                    <Label className="font-medium text-zinc-200">Also coming</Label>
                    <ul className="text-sm text-zinc-300 mt-2 list-disc ml-5">
                      {event.transport.self.map((participant, i) => (
                        <li key={i}>{participant}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            // Signed in + not registered (form)
            <form onSubmit={handleSubmit} className="space-y-4">
              {user?.isDriver ? (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="driver"
                    checked={isDriver}
                    onCheckedChange={(checked) => setIsDriver(!!checked)}
                  />
                  <Label htmlFor="driver" className="text-zinc-200">
                    I want to be a driver
                  </Label>
                </div>
              ) : null}

              {isDriver ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-zinc-300">Pickup Location</Label>
                    <Input
                      id="location"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Location"
                      required
                      className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="capacity" className="text-zinc-300">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min={1}
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      required
                      className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-zinc-300">Pickup Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          data-empty={!pickupDate}
                          className="w-full justify-start text-left font-normal border-zinc-800 text-zinc-100 hover:bg-zinc-800 data-[empty=true]:text-zinc-500"
                          type="button"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-red-500" />
                          {pickupDate ? format(pickupDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-zinc-800 bg-zinc-900">
                        <DatePicker
                          mode="single"
                          selected={pickupDate}
                          onSelect={setPickupDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="pickup-time" className="text-zinc-300">Pickup Time</Label>
                    <div className="relative flex w-full items-center">
                      <Clock2Icon className="text-zinc-500 pointer-events-none absolute left-2.5 h-4 w-4 select-none" />
                      <Input
                        id="pickup-time"
                        type="time"
                        step="1"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="appearance-none pl-8 bg-zinc-950 border-zinc-800 text-zinc-100 [&::-webkit-calendar-picker-indicator]:hidden"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="pickup" className="text-zinc-300">Pickup Location</Label>
                  {event.transport?.drivers.length === 0 ? (
                    <CardDescription className="text-zinc-500">
                      No drivers yet!
                    </CardDescription>
                  ) : (
                    <Select onValueChange={(value) => setSelectedDriver(value)}>
                      <SelectTrigger id="pickup" className="border-zinc-800 text-zinc-100">
                        <SelectValue placeholder="Select pickup location" />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
                        {event.transport?.drivers.map((driver, id) => (
                          <SelectItem key={id} value={driver.id}>
                            {driver.location} (Driver: {driver.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full bg-red-600 text-white hover:bg-red-500">
                Register
              </Button>
            </form>
          )}
        </CardContent>

        {user && isRegistered && (
          <CardFooter className="flex justify-between pt-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleUnregister}
              className="border-zinc-700 text-zinc-100 hover:bg-zinc-800"
            >
              Unregister
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Close
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
