// Tipos relacionados a dispositivos (inversores)

export enum DeviceType {
  INVERTER = 1,
  ENERGY_STORAGE = 2,
  OTHER = 3,
  MAX = 4,
  SPH = 5,
  SPA = 6,
  MIN = 7,
  PCS = 8,
  HPS = 9,
  PBD = 10,
}

export interface Device {
  device_sn: string;
  device_id: number | string;
  device_type?: DeviceType;
  type: number;
  status: number;
  lost: boolean;
  model: string;
  manufacturer: string;
  datalogger_sn: string;
  last_update_time: string;
}

export interface DeviceListData {
  devices: Device[];
  count: number;
}

// Dados real-time do MIN (TLX) - type 7
// Campos baseados no response real da API /v1/device/tlx/tlx_last_data
export interface MinDetail {
  ppv: number;
  pac: number;
  pac1: number;
  eacToday: number;
  eacTotal: number;
  vpv1: number;
  vpv2: number;
  ipv1: number;
  ipv2: number;
  vac1: number;
  fac: number;
  temp1: number;
  temp5: number;
  time: string;
  serialNum: string;
  realOPPercent: number;
  [key: string]: unknown; // Campos adicionais variáveis por modelo
}

// Dados real-time do SPH (MIX) - type 5
// Campos baseados no response real da API /v1/device/mix/mix_last_data
export interface SphDetail {
  ppv: number;
  pac: number;
  pac1: number;
  soc: number;
  vbat: number;
  eacToday: number;
  eacTotal: number;
  etogridTotal: number;
  echarge1Today: number;
  epv1Today: number;
  epvTotal: number;
  batteryTemperature: number;
  time: string;
  [key: string]: unknown; // Campos adicionais variáveis por modelo
}

// Aliases para compatibilidade (MinEnergy = MinDetail, SphEnergy = SphDetail)
export type MinEnergy = MinDetail;
export type SphEnergy = SphDetail;

export interface MinEnergyHistory {
  time: string;
  pac: number;
  eacToday: number;
}

export interface SphEnergyHistory {
  time: string;
  ppv: number;
  pac: number;
  soc: number;
  eacToday: number;
}

export interface DeviceParameter {
  parameter_id: string;
  value: unknown;
}
