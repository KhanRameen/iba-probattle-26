"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Filters {
    type?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    radius?: number;
}

interface Props {
    filters: Filters;
    onFiltersChange: (filters: Filters) => void;
    onClear: () => void;
    neighborhoods: { id: string; name: string }[];
}

export function ServiceFiltersComponent({
    filters,
    onFiltersChange,
    onClear,
}: Props) {
    return (
        <div className="flex flex-wrap gap-3">
            {/* Type */}
            <Select
                value={filters.type}
                onValueChange={(value) =>
                    onFiltersChange({ ...filters, type: value })
                }
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="SERVICE">Service</SelectItem>
                    <SelectItem value="TOOL">Tool</SelectItem>
                    <SelectItem value="SKILL">Skill</SelectItem>
                </SelectContent>
            </Select>

            {/* Radius */}
            <Select
                value={filters.radius?.toString()}
                onValueChange={(value) =>
                    onFiltersChange({ ...filters, radius: Number(value) })
                }
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Radius" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="5">5 km</SelectItem>
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="25">25 km</SelectItem>
                </SelectContent>
            </Select>

            {/* Price */}
            <Input
                type="number"
                placeholder="Min Price"
                className="w-[120px]"
                value={filters.minPrice ?? ""}
                onChange={(e) =>
                    onFiltersChange({
                        ...filters,
                        minPrice: Number(e.target.value),
                    })
                }
            />

            <Input
                type="number"
                placeholder="Max Price"
                className="w-[120px]"
                value={filters.maxPrice ?? ""}
                onChange={(e) =>
                    onFiltersChange({
                        ...filters,
                        maxPrice: Number(e.target.value),
                    })
                }
            />

            <Button variant="outline" onClick={onClear}>
                Clear
            </Button>
        </div>
    );
}
