import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-barchart',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.css']
})
export class BarchartComponent implements OnInit {
  data: any;
  options: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchChartData();
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
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
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
            color: textColorSecondary
          },
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        leftY: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Positive Cases',
            color: textColorSecondary
          },
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        rightY: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Negative Cases',
            color: textColorSecondary
          },
          ticks: {
            color: textColorSecondary
          },
          grid: {
            drawOnChartArea: false // Only want the grid lines for one axis to show up
          }
        }
      }
    };
  }

  fetchChartData() {
    this.http.get<any>('https://covid-data-app-q2-api.vercel.app/api/last7days').subscribe(data => {
      // Reverse the data array
      data = data.reverse();

      // Format the date using your custom logic
      const formattedData = data.map((item: any) => {
        const dateString = item.date.toString();
        const formattedDate = `${dateString.substr(4, 2)}-${dateString.substr(6, 2)}-${dateString.substr(0, 4)}`;
        return { ...item, date: formattedDate };
      });

      formattedData.reverse();
      
      this.data = {
        labels: formattedData.map((d: any) => d.date),
        datasets: [
          {
            label: 'Positive',
            backgroundColor: 'rgba(255, 99, 132, 0.2)', // Pastel red
            borderColor: 'rgba(255, 99, 132, 0.8)', // Slightly darker pastel red
            pointBackgroundColor: 'rgba(255, 99, 132, 0.8)',
            pointBorderColor: 'rgba(255, 99, 132, 0.8)',
            pointHoverBackgroundColor: 'rgba(255, 99, 132, 0.5)',
            pointHoverBorderColor: 'rgba(255, 99, 132, 0.5)',
            data: formattedData.map((d: any) => d.positive),
            yAxisID: 'leftY',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Negative',
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Pastel green
            borderColor: 'rgba(75, 192, 192, 0.8)', // Slightly darker pastel green
            pointBackgroundColor: 'rgba(75, 192, 192, 0.8)',
            pointBorderColor: 'rgba(75, 192, 192, 0.8)',
            pointHoverBackgroundColor: 'rgba(75, 192, 192, 0.5)',
            pointHoverBorderColor: 'rgba(75, 192, 192, 0.5)',
            data: formattedData.map((d: any) => d.negative),
            yAxisID: 'rightY',
            fill: true,
            tension: 0.4
          }
        ]
      };
    });
  }
}
