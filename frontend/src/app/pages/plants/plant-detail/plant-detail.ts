import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DebugService } from '@shyland-dev/utils';
import { forkJoin, of, catchError } from 'rxjs';

interface PlantEnergyOverview {
  peak_power_actual: number;
  monthly_energy: string;
  last_update_time: string;
  current_power: number;
  timezone: string;
  yearly_energy: string;
  today_energy: string;
  carbon_offset: string;
  total_energy: string;
}

interface PlantEnergyHistory {
  date: string;
  energy: number;
}

interface Device {
  device_sn: string;
  device_id: number | string;
  type: number;
  status: number;
  lost: boolean;
  model: string;
  last_update_time: string;
}

interface EnergyResponse {
  data: PlantEnergyOverview;
}

interface EnergyHistoryResponse {
  data: {
    data: PlantEnergyHistory[];
    count: number;
  };
}

interface DevicesResponse {
  data: {
    devices: Device[];
    count: number;
  };
}

@Component({
  selector: 'hls-plant-detail',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './plant-detail.html',
  styleUrl: './plant-detail.scss',
})
export class PlantDetail implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private debugService = inject(DebugService);

  energyOverview = signal<PlantEnergyOverview | null>(null);
  energyHistory = signal<PlantEnergyHistory[]>([]);
  devices = signal<Device[]>([]);
  loading = signal(true);
  error = signal<string>('');

  ngOnInit(): void {
    const plantId = this.route.snapshot.paramMap.get('id');
    this.debugService.log(this, 'loading plant detail...', { plantId });
    this.loadData(plantId!);
  }

  private loadData(plantId: string): void {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const startDate = this.formatDate(sevenDaysAgo);
    const endDate = this.formatDate(today);

    // Cada request é independente — se um falhar, os outros continuam
    forkJoin({
      energy: this.http.get<EnergyResponse>(`/api/plants/${plantId}/energy`).pipe(
        catchError((err) => {
          this.debugService.log(this, 'energy overview error', err);
          return of(null);
        }),
      ),
      history: this.http
        .get<EnergyHistoryResponse>(
          `/api/plants/${plantId}/energy/history?start_date=${startDate}&end_date=${endDate}&time_unit=day`,
        )
        .pipe(
          catchError((err) => {
            this.debugService.log(this, 'energy history error (endpoint may not exist)', err);
            return of(null);
          }),
        ),
      devices: this.http.get<DevicesResponse>(`/api/plants/${plantId}/devices`).pipe(
        catchError((err) => {
          this.debugService.log(this, 'devices error', err);
          return of(null);
        }),
      ),
    }).subscribe({
      next: (responses) => {
        this.debugService.log(this, 'plant detail loaded', responses);

        if (responses.energy) {
          this.energyOverview.set(responses.energy.data);
        }
        if (responses.history) {
          this.energyHistory.set(responses.history.data?.data ?? []);
        }
        if (responses.devices) {
          this.devices.set(responses.devices.data?.devices ?? []);
        }

        // Se nenhum request teve sucesso, mostrar erro
        if (!responses.energy && !responses.devices) {
          this.error.set('Erro ao carregar detalhes da planta.');
        }

        this.loading.set(false);
      },
      error: (err) => {
        this.debugService.log(this, 'unexpected error', err);
        this.error.set('Erro inesperado ao carregar detalhes da planta.');
        this.loading.set(false);
      },
    });
  }

  /** Formata Date para YYYY-MM-DD */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
