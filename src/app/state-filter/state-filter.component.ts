import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LineChartComponent } from '../line-chart/line-chart.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BarchartComponent } from '../barchart/barchart.component';

interface State {
  value: string;
  label: string;
}

@Component({
  selector: 'app-state-filter',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, LineChartComponent,BarchartComponent],
  providers: [DatePipe],
  templateUrl: './state-filter.component.html',
  styleUrls: ['./state-filter.component.css']
})
export class StateFilterComponent implements OnInit {
  selectedState: string = 'AZ'; // Variable to hold selected state value
  startDate: string = '2020-03-07';
  endDate: string = '2021-03-07';
  minEndDate: string = '2020-03-02'; // Variable to hold the end date
  states: State[] = [];
  dailyCases: number = 0;
  positiveCases: number = 0;
  percentChange: number = 0;
  recovered: number = 0;

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchStates();
    this.fetchData();
  }

  fetchStates() {
    const statesApiUrl = 'http://localhost:3000/api/states';
    this.http.get<State[]>(statesApiUrl).subscribe(
      (data: State[]) => {
        this.states = data;
      },
      (error) => {
        console.error('States API Error:', error);
      }
    );
  }

  onStateChange() {
    this.fetchData();
  }

  onDateChange(event: any, type: 'start' | 'end'): void {
    if (type === 'start') {
      // Update minimum end date based on the selected start date
      let newStartDate = new Date(this.startDate);
      let minEndDate = new Date(newStartDate);
      minEndDate.setDate(newStartDate.getDate() + 1); // Set minimum end date to start date + 1 day

      // Format minEndDate as YYYY-MM-DD
      this.minEndDate = minEndDate.toISOString().split('T')[0];

      // Ensure endDate is always greater than or equal to minEndDate
      let newEndDate = new Date(this.endDate);
      if (newEndDate < minEndDate) {
        newEndDate = new Date(minEndDate);
        this.endDate = newEndDate.toISOString().split('T')[0]; // Update endDate to meet the new minEndDate
      }
    }

    this.fetchData(); // Fetch data with updated dates
  }

  formatDateForApi(date: string): string {
    return date.replace(/-/g, '');
  }

  updateCardValues(data: any[]) {
    if (data.length > 0) {
      this.dailyCases = data[0].total || 0;
      const percentChange = (((data[1].total - data[0].total) / data[1].total) * 100).toFixed(2);
      this.percentChange = parseFloat(percentChange);
      this.recovered = data[0].recovered || 0;
    } else {
      this.dailyCases = 0;
      this.percentChange = 0;
      this.recovered = 0;
    }
  }

  fetchData() {
    const state = this.selectedState.toLowerCase();
    const formattedStartDate = this.formatDateForApi(this.startDate);
    const formattedEndDate = this.formatDateForApi(this.endDate);

  }
}
