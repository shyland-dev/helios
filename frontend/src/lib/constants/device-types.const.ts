import { DeviceType } from '../types/device.type';

// Mapeamento de DeviceType para nomes legíveis
export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  [DeviceType.INVERTER]: 'Inverter',
  [DeviceType.ENERGY_STORAGE]: 'Energy Storage',
  [DeviceType.OTHER]: 'Other',
  [DeviceType.MAX]: 'MAX',
  [DeviceType.SPH]: 'SPH (MIX)',
  [DeviceType.SPA]: 'SPA',
  [DeviceType.MIN]: 'MIN (TLX)',
  [DeviceType.PCS]: 'PCS',
  [DeviceType.HPS]: 'HPS',
  [DeviceType.PBD]: 'PBD',
} as const;
