"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
    service: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function BookingDialog({
    service,
    open,
    onOpenChange,
    onSuccess,
}: Props) {
    const [loading, setLoading] = useState(false);

    if (!service) return null;

    const handleBooking = async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceId: service.id,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Booking failed");
                return;
            }

            onSuccess();
            onOpenChange(false);
        } catch (err) {
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Booking</DialogTitle>
                </DialogHeader>

                <div className="space-y-2">
                    <p className="font-medium">{service.title}</p>
                    <p className="text-sm text-muted-foreground">
                        Provider: {service.provider.name}
                    </p>
                    <p className="text-sm">Price: Rs {service.price}</p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>

                    <Button onClick={handleBooking} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Booking...
                            </>
                        ) : (
                            "Confirm Booking"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
