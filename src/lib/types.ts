export interface Media {
    id: string;
    name: string;
    type: string;
    location: string;
    coordinates?: string; // Use a string for latitude/longitude if not using GEOGRAPHY
    price: number;
    availability: boolean;
    organization_id: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Booking {
    id: string;
    client_name: string;
    client_email: string;
    media_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    created_at?: string;
    updated_at?: string;
  }
  
  export interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    organization_id: string;
    created_at?: string;
    updated_at?: string;
  }
  