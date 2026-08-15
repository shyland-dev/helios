// Tipos relacionados a plantas (usinas solares)

export interface Plant {
  plant_id: number;
  name: string;
  status: number;
  total_energy: string;
  current_power: string;
  country: string;
  city: string;
  create_date: string;
  peak_power: number;
  longitude: string;
  latitude: string;
  user_id: number;
  locale: string;
  operator: string;
  installer: string;
  image_url: string | null;
}

export interface PlantListData {
  plants: Plant[];
  count: number;
}

export interface PlantEnergyOverview {
  peak_power_actual: number;
  monthly_energy: string;
  last_update_time: string;
  current_power: number;
  timezone: string;
  yearly_energy: string;
  today_energy: string;
  carbon_offset: string;
  efficiency: string;
  total_energy: string;
}

export interface PlantEnergyHistory {
  date: string;
  energy: number;
  power?: number;
}
