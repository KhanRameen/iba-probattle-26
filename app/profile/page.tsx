"use client";


import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
// import { toast } from "sonner";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/components/providers/auth-provider";

interface Service {
    id: string;
    title: string;
    description: string;
    price: number;
    type: "SERVICE" | "SKILL" | "TOOL";
    provider: {
        name: string;
    };
}

interface Booking {
    id: string;
    serviceId: string;
    status: string;
    service: {
        title: string;
    };
}

export default function SeekerProfile() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth(["SEEKER", "PROVIDER"]);

    const [services, setServices] = useState<Service[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    // const [searchQuery, setSearchQuery] = useState("");
    const [searchQuery] = useState("");

    console.log(services,loading)

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) router.push("/auth");
    }, [authLoading, user, router]);

     // Fetch services available to seeker
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/services?${params.toString()}`);
      if (res.ok) {
        const data: Service[] = await res.json();
        setServices(data);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error(err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

    // Fetch seeker bookings
    const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data: Booking[] = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

    useEffect(() => {
        if (!authLoading && user) {
            fetchServices();
            fetchBookings();
        }
    }, [authLoading, user]);

    // const handleBook = async (serviceId: string) => {
    //     try {
    //         const res = await fetch("/api/bookings", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ serviceId }),
    //         });
    //         if (res.ok) {
    //             toast.success("Booked successfully");
    //             fetchBookings();
    //         } else {
    //             const err = await res.json();
    //             toast.error(err?.error || "Failed to book");
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Error booking service");
    //     }
    // };

    if (authLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <Navbar />

            <h1 className="text-3xl font-bold mb-6">Seeker Profile</h1>

            <section className="mb-8">
                <h2 className="text-xl font-semibold">Your Info</h2>
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
                <p>Neighborhood: {user.neighborhoodId || "Not assigned"}</p>
            </section>



            {/* Bookings */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold">Your Bookings</h2>
                {bookings.length === 0 ? (
                    <p>No bookings yet</p>
                ) : (
                    <ul className="space-y-2 mt-4">
                        {bookings.map((b) => (
                            <li key={b.id} className="border p-2 rounded">
                                Service: {b.service.title} - Status: {b.status}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
