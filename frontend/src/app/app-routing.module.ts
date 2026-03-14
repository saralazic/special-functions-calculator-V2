import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { FunctionInformationComponent } from './components/function-information/function-information.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { SpecialFunctionComponent } from './components/function/special-function/special-function.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

const routes: Routes = [
  { path: '', redirectTo: '/homepage', pathMatch: 'full' },
  { path: 'special-function/:parameter', component: SpecialFunctionComponent },
  { path: 'homepage', component: HomepageComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'chatbot', component: ChatbotComponent },
  {
    path: 'function-informations/:parameter',
    component: FunctionInformationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
