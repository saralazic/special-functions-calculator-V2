import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LanguageService } from 'src/app/services/language-service/language.service';

@Component({
  standalone: false,
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnInit {
  private subscription?: Subscription;
  contactForm!: FormGroup;

  emailIconPath = 'assets/icons/email.svg';

  name?: string;
  message?: string;
  subject?: string;
  submit?: string;
  contactUs?: string;
  subtitle?: string;
  response?: string;

  showResponse?: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadTranslations();
    this.showResponse = false;
    this.subscription = this.languageService
      .getLanguageChangeObservable()
      .subscribe(() => {
        this.loadTranslations();
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  loadTranslations() {
    const selectedLanguage = this.languageService.getSelectedLanguage();
    this.http
      .get(`./assets/i18n/${selectedLanguage}.json`)
      .subscribe((translations: any) => {
        this.name = translations.contact.name;
        this.subject = translations.contact.subject;
        this.message = translations.contact.message;
        this.contactUs = translations.contact.title;
        this.subtitle = translations.contact.subtitle;
        this.submit = translations.contact.button;
        this.response = translations.contact.success;
      });
  }

  initForm() {
    this.contactForm = this.formBuilder.group({
      name: ['', Validators.required],
      subject: ['', [Validators.required]],
      message: ['', Validators.required],
    });
  }

  submitForm() {
    if (this.contactForm && this.contactForm.valid) {
      const formData = this.contactForm.value;

      this.showResponse = true;

      const recipient = 'sara.lazic@outlook.com';
      const subject = formData.subject;
      const body = `${formData.message}\n\n${formData.name}`;

      const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      window.location.href = mailtoLink;
    }
  }
}
