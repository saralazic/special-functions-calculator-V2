import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-result-display',
  templateUrl: './result-display.component.html',
  styleUrls: ['./result-display.component.css'],
})
export class ResultDisplayComponent {
  @Input() result?: string;
  @Output() calculationResult = new EventEmitter<string>(); // Specify the type here

  showResult: boolean = false;

  ngOnInit() {
    this.showResult = true;
  }
}
