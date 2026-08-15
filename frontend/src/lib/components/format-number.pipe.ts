import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para formatar números com casas decimais limitadas.
 * Uso: {{ value | formatNumber }} → 2 casas decimais (padrão)
 * Uso: {{ value | formatNumber:0 }} → sem casas decimais
 * Uso: {{ value | formatNumber:3 }} → 3 casas decimais
 *
 * Aceita string ou number. Retorna '—' se o valor for inválido.
 */
@Pipe({
  name: 'formatNumber',
  standalone: true,
})
export class FormatNumberPipe implements PipeTransform {
  transform(value: string | number | null | undefined, decimals: number = 2): string {
    if (value === null || value === undefined || value === '') return '—';

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '—';

    return num.toFixed(decimals);
  }
}
