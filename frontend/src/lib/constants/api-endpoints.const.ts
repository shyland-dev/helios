// Endpoints da API Growatt Open API V1
export const API_ENDPOINTS = {
  // Genéricos (plantas)
  PLANT_LIST: 'plant/list',
  PLANT_DATA: 'plant/data',
  PLANT_ENERGY_HISTORY: 'plant/energy/history',
  DEVICE_LIST: 'device/list',

  // MIN (TLX) - type 7
  MIN_ENERGY: 'device/min/energy',
  MIN_DETAIL: 'device/min/detail',
  MIN_ENERGY_HISTORY: 'device/min/energy/history',
  MIN_SETTINGS: 'device/min/settings',
  MIN_READ_PARAMETER: 'device/min/read_parameter',
  MIN_WRITE_PARAMETER: 'device/min/write_parameter',

  // SPH (MIX) - type 5
  SPH_ENERGY: 'device/sph/energy',
  SPH_DETAIL: 'device/sph/detail',
  SPH_ENERGY_HISTORY: 'device/sph/energy/history',
  SPH_READ_PARAMETER: 'device/sph/read_parameter',
  SPH_WRITE_PARAMETER: 'device/sph/write_parameter',
} as const;
