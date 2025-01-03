"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"

export interface Media {
  image_urls: any;
  id: string;
  name: string;
  location: string;
  city: string;
  type: string;
  subtype: string;
  width: number;
  height: number;
  traffic: string;
  price: number;
  availability: string;
  thumbnail: string;
}

export const columns: ColumnDef<Media>[] = [
  
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "subtype",
    header: "Subtype",
  },
  {
    accessorKey: "width",
    header: "Width",
  },
  {
    accessorKey: "height",
    header: "Height",
  },
  {
    accessorKey: "traffic",
    header: "Traffic",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "availability",
    header: "Availability",
  },
  {
    accessorKey: "thumbnail",
    header: "Thumbnail",
    cell: ({ row }) => {
      const thumbnail = row.getValue("thumbnail") as string;
      return (
        <div className="w-10 h-10">
          <Image
            src={thumbnail || "/placeholder.svg"}
            alt="Thumbnail"
            width={40}
            height={40}
            className="rounded-md object-cover"
          />
        </div>
      );
    },
  },
]

