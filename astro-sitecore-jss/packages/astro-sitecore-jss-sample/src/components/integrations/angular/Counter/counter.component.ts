import { Component } from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  standalone: true,
})
export default class CounterComponent {
  count!: number;

  constructor() { }

  ngOnInit() {
    this.count = 0;
  }
}