export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServicesResponse {
  services: Service[];
}
