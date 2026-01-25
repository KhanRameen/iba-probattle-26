"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Neighborhood = {
    id: string;
    name: string;
};

export default function OnboardingPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [role, setRole] = useState<"PROVIDER" | "SEEKER" | "">("");
    const [neighborhoodId, setNeighborhoodId] = useState("");

    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/neighborhoods")
            .then((res) => res.json())
            .then(setNeighborhoods)
            .catch(() => setError("Failed to load neighborhoods"));
    }, []);


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!name || !role || !neighborhoodId) {
            setError("All fields are required");
            return;
        }

        setLoading(true);

        const res = await fetch("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                role,
                neighborhoodId,
            }),
        });

        const data = await res.json();

        setLoading(false);

        if (!res.ok) {
            setError(data?.error?.formErrors?.[0] || "Something went wrong");
            return;
        }

        toast.success("Redirecting to your Home Screen")

        if (role === "PROVIDER") {
            router.push("/provider/dashboard");
        } else {
            router.push("/seeker/home");
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-[510px]"
            >
                <h1 className="text-2xl font-bold mb-2">Complete your profile</h1>
                <p className="text-gray-500 mb-6">
                    Tell us a bit about yourself
                </p>

                {error && (
                    <p className="bg-red-100 text-red-700 p-2 rounded mb-4">
                        {error}
                    </p>
                )}

                {/* NAME */}
                <div className="mb-4">
                    <label className="block mb-1 font-medium">Full Name</label>
                    <input
                        className="w-full border rounded px-3 py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                    />
                </div>

                {/* ROLE */}
                <div className="mb-4">
                    <label className="block mb-1 font-medium">I am a</label>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={role}
                        onChange={(e) =>
                            setRole(e.target.value as "PROVIDER" | "SEEKER")
                        }
                    >
                        <option value="">Select role</option>
                        <option value="PROVIDER">Service Provider</option>
                        <option value="SEEKER">Service Seeker</option>
                    </select>
                </div>

                {/* NEIGHBORHOOD */}
                <div className="mb-6">
                    <label className="block mb-1 font-medium">
                        Neighborhood
                    </label>
                    <select
                        className="w-full border rounded px-3 py-2"
                        value={neighborhoodId}
                        onChange={(e) => setNeighborhoodId(e.target.value)}
                    >
                        <option value="">Select neighborhood</option>
                        {neighborhoods.map((n) => (
                            <option key={n.id} value={n.id}>
                                {n.name}
                            </option>
                        ))}
                    </select>
                </div>

                <hr className="w-full bg-primary"></hr>
                {/* SUBMIT */}
                <button
                    disabled={loading}
                    className="w-full bg-primary text-white py-2 rounded hover:opacity-90"
                >
                    {loading ? "Saving..." : "Continue"}
                </button>
            </form>
        </div>
    );
}
