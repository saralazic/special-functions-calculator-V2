import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly baseUrl = 'http://localhost:8000/chat';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatResponse> {
    return this.http
      .post<{ response?: string; error?: string }>(this.baseUrl, {
        prompt: message,
      })
      .pipe(
        map((res) => ({
          reply: res.response || res.error || 'No response from model.',
        }))
      );
  }
}
