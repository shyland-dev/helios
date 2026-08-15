import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DebugService } from '@shyland-dev/utils';
import { forkJoin, map, switchMap } from 'rxjs';

interface Plant {
  plant_id: number;
  name: string;
}

interface PlantsResponse {
  data: {
    plants: Plant[];
    count: number;
  };
}

interface Device {
  device_sn: string;
  device_id: number | string;
  type: number;
  status: number;
  lost: boolean;
  model: string;
  manufacturer: string;
  datalogger_sn: string;
  last_update_time: string;
}

interface DevicesResponse {
  data: {
    devices: Device[];
    count: number;
  };
}

// Dispositivo com informação da planta associada
export interface DeviceWithPlant extends Device {
  plant_name: string;
}

@Component({
  selector: 'hls-devices',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './devices.html',
  styleUrl: './devices.scss',
})
export class Devices implements OnInit {
  private http = inject(HttpClient);
  private debugService = inject(DebugService);

  devices = signal<DeviceWithPlant[]>([]);
  loading = signal(true);
  error = signal<string>('');

  ngOnInit(): void {
    this.debugService.log(this, 'loading devices...');
    this.loadDevices();
  }

  private loadDevices(): void {
    this.http
      .get<PlantsResponse>('/api/plants')
      .pipe(
        switchMap((plantsResponse) => {
          const plants = plantsResponse.data.plants ?? [];
          this.debugService.log(this, 'plants loaded', plants);

          // Para cada planta, buscar seus dispositivos
          const deviceRequests = plants.map((plant) =>
            this.http.get<DevicesResponse>(`/api/plants/${plant.plant_id}/devices`).pipe(
              map((devicesResponse) =>
                (devicesResponse.data.devices ?? []).map((device) => ({
                  ...device,
                  plant_name: plant.name,
                })),
              ),
            ),
          );

          return forkJoin(deviceRequests);
        }),
      )
      .subscribe({
        next: (results) => {
          const allDevices = results.flat();
          this.debugService.log(this, 'devices loaded', allDevices);
          this.devices.set(allDevices);
          this.loading.set(false);
        },
        error: (err) => {
          this.debugService.log(this, 'error loading devices', err);
          this.error.set(err.error?.error ?? 'Erro ao carregar dispositivos.');
          this.loading.set(false);
        },
      });
  }
}
