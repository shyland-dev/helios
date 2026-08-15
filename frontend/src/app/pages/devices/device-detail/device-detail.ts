import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UpperCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DebugService } from '@shyland-dev/utils';

interface MinDetail {
  ppv: number;
  pac: number;
  eacToday: number;
  eacTotal: number;
  vpv1: number;
  vpv2: number;
  ipv1: number;
  ipv2: number;
  vac1: number;
  fac: number;
  temp1: number;
  time: string;
  realOPPercent: number;
}

interface DetailResponse {
  data: MinDetail;
  device_type: 'min' | 'sph';
}

interface EnergyResponse {
  data: object;
  device_type: 'min' | 'sph';
}

interface DataCard {
  label: string;
  value: number | string;
  unit: string;
}

@Component({
  selector: 'hls-device-detail',
  standalone: true,
  imports: [UpperCasePipe, TranslateModule],
  templateUrl: './device-detail.html',
  styleUrl: './device-detail.scss',
})
export class DeviceDetail implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private debugService = inject(DebugService);

  sn = signal<string>('');
  deviceType = signal<string>('');
  detail = signal<MinDetail | null>(null);
  cards = signal<DataCard[]>([]);
  loading = signal(true);
  error = signal<string>('');

  ngOnInit(): void {
    const sn = this.route.snapshot.paramMap.get('sn') ?? '';
    this.sn.set(sn);
    this.debugService.log(this, 'loading device detail for SN:', sn);
    this.loadDetail(sn);
  }

  private loadDetail(sn: string): void {
    this.http.get<DetailResponse>(`/api/devices/${sn}/detail`).subscribe({
      next: (response) => {
        this.debugService.log(this, 'detail loaded', response.data);
        this.deviceType.set(response.device_type);
        this.detail.set(response.data);
        this.buildCards(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.debugService.log(this, 'error loading detail', err);
        this.error.set(err.error?.error ?? 'Erro ao carregar detalhes do dispositivo.');
        this.loading.set(false);
      },
    });

    this.http.get<EnergyResponse>(`/api/devices/${sn}/energy`).subscribe({
      next: (response) => {
        this.debugService.log(this, 'energy loaded', response.data);
      },
      error: (err) => {
        this.debugService.log(this, 'error loading energy', err);
      },
    });
  }

  private buildCards(data: MinDetail): void {
    this.cards.set([
      { label: 'device_detail.ppv', value: data.ppv, unit: 'W' },
      { label: 'device_detail.pac', value: data.pac, unit: 'W' },
      { label: 'device_detail.eac_today', value: data.eacToday, unit: 'kWh' },
      { label: 'device_detail.eac_total', value: data.eacTotal, unit: 'kWh' },
      { label: 'device_detail.vpv1', value: data.vpv1, unit: 'V' },
      { label: 'device_detail.vpv2', value: data.vpv2, unit: 'V' },
      { label: 'device_detail.ipv1', value: data.ipv1, unit: 'A' },
      { label: 'device_detail.ipv2', value: data.ipv2, unit: 'A' },
      { label: 'device_detail.vac1', value: data.vac1, unit: 'V' },
      { label: 'device_detail.fac', value: data.fac, unit: 'Hz' },
      { label: 'device_detail.temp', value: data.temp1, unit: '°C' },
      { label: 'device_detail.op_percent', value: data.realOPPercent, unit: '%' },
    ]);
  }
}
