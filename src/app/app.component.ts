import { Component } from '@angular/core';
import { LanguageService } from './services/language-service/language.service';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'spef-calculator';
  constructor(public languageService: LanguageService) {}
}
