"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Navbar } from "@/components/navbar";

interface Service {
    id: string;
    title: string;
    description: string;
    price: number;
    type: "SERVICE" | "SKILL" | "TOOL";
    neighborhood: { name: string };
    bookings: { id: string; seeker: { name: string }; status: string; rating: number | null }[];
}

interface Neighborhood {
    id: string;
    name: string;
}

export default function ProviderDashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth(["PROVIDER"]);

    const [services, setServices] = useState<Service[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [loading, setLoading] = useState(true);

    const [newService, setNewService] = useState({
        title: "",
        description: "",
        price: 0,
        type: "SERVICE" as "SERVICE" | "SKILL" | "TOOL",
        neighborhoodId: "", // store id now
    });

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) router.push("/auth");
    }, [authLoading, user, router]);

    // Fetch services
    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/provider/services");
            if (res.ok) setServices(await res.json());
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch services");
        } finally {
            setLoading(false);
        }
    };

    // Fetch neighborhoods for dropdown
    const fetchNeighborhoods = async () => {
        try {
            const res = await fetch("/api/neighborhoods");
            if (res.ok) setNeighborhoods(await res.json());
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch neighborhoods");
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchServices();
            fetchNeighborhoods();
        }
    }, [authLoading, user]);

    // Create service
    const handleCreateService = async () => {
        const { title, description, price, type, neighborhoodId } = newService;
        if (!title || !description || !price || !type || !neighborhoodId) {
            toast.error("All fields are required");
            return;
        }

        try {
            const res = await fetch("/api/provider/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    price,
                    type,
                    neighborhoodName: neighborhoods.find(n => n.id === neighborhoodId)?.name,
                }),
            });

            if (res.ok) {
                toast.success("Service created");
                setNewService({ title: "", description: "", price: 0, type: "SERVICE", neighborhoodId: "" });
                fetchServices();
            } else {
                const err = await res.json();
                toast.error(err?.error || "Failed to create service");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error creating service");
        }
    };

    if (authLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="mb-12">
                <Navbar />
            </div>
            <h1 className="text-3xl font-bold mb-6">Provider Dashboard</h1>

            {/* Create Service */}
            <div className="mb-6 space-y-2 border p-4 rounded">
                <h2 className="font-bold">Create New Service</h2>
                <Input
                    placeholder="Title"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                />
                <Input
                    placeholder="Description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                />
                <Input
                    placeholder="Price"
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                />

                {/* Neighborhood dropdown */}
                <div className="mb-2">
                    <h2 className="font-semibold">Neighborhood</h2>
                    <select
                        value={newService.neighborhoodId}
                        onChange={(e) => setNewService({ ...newService, neighborhoodId: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                    >
                        <option value="">Select neighborhood</option>
                        {neighborhoods.map((n) => (
                            <option key={n.id} value={n.id}>
                                {n.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Type dropdown */}
                <div className="mb-2">
                    <h2 className="font-semibold">Type</h2>
                    <select
                        value={newService.type}
                        onChange={(e) =>
                            setNewService({ ...newService, type: e.target.value as "SERVICE" | "SKILL" | "TOOL" })
                        }
                        className="border rounded px-2 py-1 w-full"
                    >
                        <option value="SERVICE">SERVICE</option>
                        <option value="SKILL">SKILL</option>
                        <option value="TOOL">TOOL</option>
                    </select>
                </div>

                <Button onClick={handleCreateService}>Create Service</Button>
            </div>

            {/* Services */}
            <div className="mb-6 space-y-2 border p-4 rounded">
                <h2 className="font-bold">Your Services</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : services.length === 0 ? (
                    <p>No services yet</p>
                ) : (
                    services.map((s) => (
                        <div key={s.id} className="border p-2 rounded mb-2">
                            <strong>{s.title}</strong> - ${s.price} ({s.type}) - Neighborhood: {s.neighborhood.name}
                            {s.bookings.length > 0 && (
                                <ul className="mt-2">
                                    {s.bookings.map((b) => (
                                        <li key={b.id}>
                                            {b.seeker.name} - {b.status} {b.rating ? `(Rated: ${b.rating})` : ""}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
