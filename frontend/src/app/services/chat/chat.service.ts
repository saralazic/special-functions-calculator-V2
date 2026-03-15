import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

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
  private readonly baseUrl = '/api/chat';
  private useStub = true;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatResponse> {
    if (this.useStub) {
      return this.stubResponse(message);
    }
    return this.http.post<ChatResponse>(this.baseUrl, { message });
  }

  private stubResponse(message: string): Observable<ChatResponse> {
    const lowerMsg = message.toLowerCase();

    let reply: string;
    if (lowerMsg.includes('bessel')) {
      reply =
        'Bessel functions of the first kind J_n(x) are solutions to Bessel\'s differential equation. They appear frequently in problems with cylindrical symmetry. You can calculate them on the homepage!';
    } else if (lowerMsg.includes('gamma')) {
      reply =
        'The Gamma function \u0393(z) extends the factorial to complex and real numbers. For positive integers, \u0393(n) = (n-1)! Try computing it in the calculator!';
    } else if (lowerMsg.includes('beta')) {
      reply =
        'The Beta function B(x,y) is closely related to the Gamma function: B(x,y) = \u0393(x)\u0393(y)/\u0393(x+y). It\'s widely used in probability and statistics.';
    } else if (
      lowerMsg.includes('legendre') ||
      lowerMsg.includes('laguerre') ||
      lowerMsg.includes('chebyshev') ||
      lowerMsg.includes('hermite') ||
      lowerMsg.includes('jacobi')
    ) {
      reply =
        'Orthogonal polynomials are a fascinating family of functions! You can explore and compute them using the calculators on the homepage.';
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      reply =
        'Hello! I\'m the Special Functions assistant. Ask me about Bessel, Gamma, Beta functions, or any of the polynomials available in the calculator!';
    } else {
      reply = `You said: "${message}". I'm a stub chatbot for now — once the backend is connected, I'll be able to give you real answers about special functions!`;
    }

    return of({ reply }).pipe(delay(600 + Math.random() * 800));
  }
}
