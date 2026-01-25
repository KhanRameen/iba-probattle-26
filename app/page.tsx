"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ServiceCard } from "@/components/service-card";
import { ServiceFiltersComponent } from "@/components/service-filter";
import { BookingDialog } from "@/components/booking-dailog";
import { useAuth } from "@/components/providers/auth-provider";


interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  price: number;
  h3Index: string;
  providerId: string;
  provider: { name: string };
  bookings: Array<{ id: string; seekerId: string; rating: number | null }>;
}

interface Neighborhood {
  id: string;
  name: string;
}

interface Filters {
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  radius?: number;
  neighborhoodId?: string;
}

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(["SEEKER", "PROVIDER"]);

  const [services, setServices] = useState<Service[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Redirect once if onboarding not complete
  useEffect(() => {
    if (!authLoading) {
      if (!user?.neighborhoodId) {
        toast.info("Please complete your profile first.");
        router.push("/onboarding");
      }
    }
    if (!user) {
      router.push("/auth");
    }
  }, [authLoading, user, router]);

  // Fetch neighborhoods once
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const res = await fetch("/api/neighborhoods");
        if (res.ok) {
          const data = await res.json();
          setNeighborhoods(data);
        }
      } catch (err) {
        console.error("Failed to fetch neighborhoods", err);
      }
    };
    fetchNeighborhoods();
  }, []);

  // Fetch services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
      if (filters.radius) params.append("radius", filters.radius.toString());
      if (filters.neighborhoodId) params.append("neighborhoodId", filters.neighborhoodId);

      const res = await fetch(`/api/services?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Failed to fetch services", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch services when filters or user are ready
  useEffect(() => {
    if (!authLoading && user) fetchServices();
  }, [filters, authLoading, user]);

  const filteredServices = services.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.provider.name.toLowerCase().includes(q)
    );
  });

  const handleBook = (service: Service) => {
    setSelectedService(service);
    setBookingOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Find Trusted Services in Your <span className="text-primary">Neighborhood</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Connect with local service providers for cleaning, repairs, tutoring, and more.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-10 pr-4"
                />
              </div>
              <Button
                size="lg"
                className="h-12 gap-2"
                onClick={() => setFilters({ ...filters, radius: 5 })}
              >
                <MapPin className="h-5 w-5" />
                Near Me
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Available Services</h2>
            <p className="mt-1 text-muted-foreground">
              {filteredServices.length} services found
              {filters.radius && ` within ${filters.radius} km`}
            </p>
          </div>
          <ServiceFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onClear={() => {
              setFilters({});
              setSearchQuery("");
            }}
            neighborhoods={neighborhoods}
          />
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No services found</h3>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Try adjusting your filters or search query to find more services.
            </p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setFilters({});
                setSearchQuery("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={handleBook}
                isOwnService={user.id === service.providerId}
              />
            ))}
          </div>
        )}
      </section>

      <BookingDialog
        service={selectedService}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        onSuccess={fetchServices}
      />
    </div>
  );
}
