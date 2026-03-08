import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './components/about/about.component';
import { CalculatorComponent } from './components/function/calculator/calculator.component';
import { ContactComponent } from './components/contact/contact.component';
import { FunctionInformationComponent } from './components/function-information/function-information.component';
import { FunctionInputComponent } from './components/function/function-input/function-input.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { FooterComponent } from './components/marginals/footer/footer.component';
import { HeaderComponent } from './components/marginals/header/header.component';
import { SpecialFunctionComponent } from './components/function/special-function/special-function.component';
import { SvgIconComponent } from './components/svg-icon/svg-icon.component';
import { ResultDisplayComponent } from './components/function/result-display/result-display.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    AppComponent,
    SvgIconComponent,
    SpecialFunctionComponent,
    HomepageComponent,
    AboutComponent,
    HeaderComponent,
    FooterComponent,
    ContactComponent,
    CalculatorComponent,
    FunctionInputComponent,
    FunctionInformationComponent,
    ResultDisplayComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatMenuModule,
    MatIconModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatTooltipModule,
    MatCardModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
