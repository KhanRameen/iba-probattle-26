"use client";
import { Prisma } from "@/generated/prisma/client";
import { useEffect, useState } from "react";

type ServiceWithBookings = Prisma.ServiceGetPayload<{
    include: { bookings: true };
}>;

export default function ProviderDashboard() {
    const [services, setServices] = useState<ServiceWithBookings[]>([]);

    useEffect(() => {
        fetch("/api/provider/services")
            .then(res => res.json())
            .then(setServices);
    }, []);

    return (
        <div>
            <h1>Provider Dashboard</h1>
            <a href="/provider/services/create">Create New Service</a>
            <h2>Your Services</h2>
            {services.map(s => (
                <div key={s.id} style={{ border: "1px solid gray", padding: 10, margin: 5 }}>
                    <h3>{s.title} ({s.type})</h3>
                    <p>{s.description}</p>
                    <p>Category: {s.type} | Price: {s.price}</p>
                    <p>Bookings: {s.bookings.length}</p>
                    <p>
                        Average Rating: {s.bookings.filter(b => b.rating).reduce((acc, b) => acc + (b.rating || 0), 0) / (s.bookings.filter(b => b.rating).length || 1)}
                    </p>
                </div>
            ))}
        </div>
    );
}
