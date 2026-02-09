"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export interface Service {
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


interface ServiceCardProps {
    service:Service
    isOwnService: boolean;
    onBook: (service: Service) => void;
}

export function ServiceCard({
    service,
    isOwnService,
    onBook,
}: ServiceCardProps) {
    const ratings = service.bookings.filter(b => b.rating !== null);
    const avgRating =
        ratings.length > 0
            ? (
                ratings.reduce((sum, r) => sum + (r.rating || 0), 0) /
                ratings.length
            ).toFixed(1)
            : null;

    return (
        <Card className="flex flex-col justify-between">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                    <Badge variant="secondary">{service.type}</Badge>
                    {avgRating && (
                        <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {avgRating}
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-semibold">{service.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                </p>
            </CardHeader>

            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Provider: <span className="font-medium">{service.provider.name}</span>
                </p>
            </CardContent>

            <CardFooter className="flex items-center justify-between">
                <p className="text-lg font-bold">Rs {service.price}</p>

                <Button
                    disabled={isOwnService}
                    onClick={() => onBook(service)}
                >
                    {isOwnService ? "Your Service" : "Book"}
                </Button>
            </CardFooter>
        </Card>
    );
}


//todo: fix