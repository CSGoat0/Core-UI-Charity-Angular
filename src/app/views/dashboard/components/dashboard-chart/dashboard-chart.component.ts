import './chart.config';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import {
  ChartConfiguration,
  ChartData,
  ChartOptions,
  ChartType
} from 'chart.js';

@Component({
  selector: 'app-dashboard-chart',
  templateUrl: './dashboard-chart.component.html',
  imports: [CommonModule, BaseChartDirective]
})
export class DashboardChartComponent implements OnChanges {
  @Input() type: ChartType = 'bar';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() label: string = 'Data';
  @Input() title: string = '';
  @Input() height: number = 220;

  chartData: ChartData = { labels: [], datasets: [] };
  chartOptions: ChartOptions = {};
  chartType: ChartType = 'bar';

  private colorPalette = [
    'rgba(50, 31, 219, 0.7)',
    'rgba(46, 184, 92, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(231, 76, 60, 0.7)',
    'rgba(155, 89, 182, 0.7)',
    'rgba(52, 152, 219, 0.7)',
    'rgba(241, 196, 15, 0.7)'
  ];

  private borderPalette = [
    'rgba(50, 31, 219, 1)',
    'rgba(46, 184, 92, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(231, 76, 60, 1)',
    'rgba(155, 89, 182, 1)',
    'rgba(52, 152, 219, 1)',
    'rgba(241, 196, 15, 1)'
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type'] || changes['labels'] || changes['data'] || changes['label']) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    this.chartType = this.type;

    const isDoughnutOrPie = this.type === 'doughnut' || this.type === 'pie';
    const isLine = this.type === 'line';

    const backgroundColors = isDoughnutOrPie
      ? this.labels.map((_, i) => this.colorPalette[i % this.colorPalette.length])
      : isLine
        ? 'rgba(50, 31, 219, 0.15)'
        : this.colorPalette[0];

    const borderColors = isDoughnutOrPie
      ? this.labels.map((_, i) => this.borderPalette[i % this.borderPalette.length])
      : this.borderPalette[0];

    this.chartData = {
      labels: this.labels,
      datasets: [
        {
          data: this.data,
          label: this.label,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: isLine ? 2 : 1,
          tension: isLine ? 0.35 : 0,
          fill: isLine,
          pointBackgroundColor: isLine ? this.borderPalette[0] : undefined,
          pointRadius: isLine ? 3 : undefined
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: isDoughnutOrPie,
          position: 'bottom'
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => {
              const value = context.parsed.y ?? context.parsed;
              return `${context.dataset.label}: ${(value as number).toLocaleString()} EGP`;
            }
          }
        }
      },
      scales: isDoughnutOrPie
        ? {}
        : {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => (value as number).toLocaleString()
              }
            }
          }
    };
  }
}
