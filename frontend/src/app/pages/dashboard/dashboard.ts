import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DebugService } from '@shyland-dev/utils';

interface Plant {
  plant_id: number;
  name: string;
  status: number;
  current_power: string;
  total_energy: string;
}

interface PlantsResponse {
  data: {
    plants: Plant[];
    count: number;
  };
}

@Component({
  selector: 'hls-dashboard',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  private debugService = inject(DebugService);

  plants = signal<Plant[]>([]);
  loading = signal(true);
  error = signal<string>('');

  ngOnInit(): void {
    this.debugService.log(this, 'loading plants...');
    this.loadPlants();
  }

  private loadPlants(): void {
    this.http.get<PlantsResponse>('/api/plants').subscribe({
      next: (response) => {
        this.debugService.log(this, 'plants loaded', response.data);
        this.plants.set(response.data.plants ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.debugService.log(this, 'error loading plants', err);
        this.error.set(err.error?.error ?? 'Erro ao carregar plantas.');
        this.loading.set(false);
      },
    });
  }
}
