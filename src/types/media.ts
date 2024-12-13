// src/types/media.ts

export interface Media {
    id: string;
    name: string;
    type: string;
    location: string;
    price: number;
    availability: boolean;
    created_at: string | null;
    updated_at: string | null;
    user_id: string;
    code: string | null;
    subtype: string | null;
    geolocation: {
      latitude?: number;
      longitude?: number;
    } | null;
    width: number | null;
    height: number | null;
    city: string | null;
    traffic: string | null;
    photos?: string[]; // New field
  }
  