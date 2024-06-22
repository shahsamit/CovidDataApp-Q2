import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges, PLATFORM_ID } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { isPlatformBrowser } from '@angular/common';
import zoomPlugin from 'chartjs-plugin-zoom';
@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit, OnChanges {
  @Input() selectedState: string = '';
  @Input() startDate: string = '';
  @Input() endDate: string = '';

  data: any;
  options: any;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      import('chartjs-plugin-zoom').then((zoomPlugin) => {
        Chart.register(zoomPlugin.default);
        this.fetchData();
      }).catch(error => {
        console.error('Error importing chartjs-plugin-zoom:', error);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedState'] || changes['startDate'] || changes['endDate']) {
      this.fetchData();
    }
  }

  fetchData() {
    if (!this.selectedState || !this.startDate || !this.endDate) {
      return;
    }

    const apiUrl = `https://covid-data-app-q2-api.vercel.app/api/covid-data`;

    const requestBody = {
      state: this.selectedState,
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.http.post<any[]>(apiUrl, requestBody).subscribe(
      (data: any[]) => {
        const filteredData = data.filter(item => item.date >= parseInt(this.startDate) && item.date <= parseInt(this.endDate));
        const dates = filteredData.map(item => {
          const dateString = item.date.toString();
          const formattedDate = `${dateString.substr(4, 2)}-${dateString.substr(6, 2)}-${dateString.substr(0, 4)}`;
          return formattedDate;
        }).reverse();

        const positiveCases = filteredData.map(item => item.positive).reverse();
        const negativeCases = filteredData.map(item => item.negative).reverse();

        this.data = {
          labels: dates,
          datasets: [
            {
              label: 'Positive Cases',
              type: 'line',
              data: positiveCases,
              fill: true,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 0.8)',
              pointBackgroundColor: 'rgba(255, 99, 132, 0.8)',
              pointBorderColor: 'rgba(255, 99, 132, 0.8)',
              pointHoverBackgroundColor: 'rgba(255, 99, 132, 0.5)',
              pointHoverBorderColor: 'rgba(255, 99, 132, 0.5)',
              tension: 0.4,
              yAxisID: 'leftY'
            },
            {
              label: 'Negative Cases',
              type: 'line',
              data: negativeCases,
              fill: true,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 0.8)',
              pointBackgroundColor: 'rgba(75, 192, 192, 0.8)',
              pointBorderColor: 'rgba(75, 192, 192, 0.8)',
              pointHoverBackgroundColor: 'rgba(75, 192, 192, 0.5)',
              pointHoverBorderColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.4,
              yAxisID: 'rightY'
            }
          ]
        };

        this.options = {
          maintainAspectRatio: false,
          aspectRatio: 0.8,
          plugins: {
            legend: {
              labels: {
                color: '#495057'
              }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y !== null ? context.parsed.y : '';
                  return `${label}: ${value}`;
                }
              }
            },
            zoom: {
              pan: {
                enabled: true,
                mode: 'x',
              },
              zoom: {
                wheel: {
                  enabled: true,
                },
                pinch: {
                  enabled: true
                },
                mode: 'x',
              }
            }
          },
          scales: {
            x: {
              position: 'bottom',
              title: {
                display: false,
                text: 'Date',
                color: '#000',
                font: {
                  size: 17
                }
              },
              ticks: {
                color: '#6c757d',
                font: {
                  size: 14
                },
                // Adjust the maximum number of ticks displayed
                maxTicksLimit: 26, // Example value, adjust as needed
                // Adjust padding between ticks
                padding: 3, // Example value, adjust as needed
              },
              grid: {
                color: '#dee2e6',
              }
            },
            leftY: {
              type: 'linear',
              position: 'left',
              title: {
                display: true,
                text: 'Positive Cases',
                color: '#000',
                font: {
                  size: 17
                }
              },
              ticks: {
                color: '#6c757d',
                font: {
                  size: 14
                }
              },
              grid: {
                color: '#dee2e6',
                drawBorder: false
              }
            },
            rightY: {
              type: 'linear',
              position: 'right',
              title: {
                display: true,
                text: 'Negative Cases',
                color: '#000',
                font: {
                  size: 17
                }
              },
              ticks: {
                color: '#6c757d',
                font: {
                  size: 14
                }
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        };
      },
      error => {
        console.error('Error fetching data', error);
      }
    );
  }
}
