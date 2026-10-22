import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private recommendUrl = 'http://localhost:5000/api/recommendation';
  private bookingsUrl = 'http://localhost:5000/api/bookings';

  private bookingsSubject = new BehaviorSubject<any[]>([]);
  bookings$ = this.bookingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // --- GEMINI AI RECOMMENDATION ---
  getGeminiRecommendation(promptText: string): Observable<any> {
    return this.http.post(this.recommendUrl, { prompt: promptText });
  }

  // --- BOOKINGS MANAGEMENT ---
  loadAllBookings() {
    this.http.get<any[]>(this.bookingsUrl).subscribe({
      next: (data) => {
        this.bookingsSubject.next(data || []);
      },
      error: (err) => {
        console.error('Error loading bookings from backend:', err);
      }
    });
  }

  get allBookingsValue(): any[] {
    return this.bookingsSubject.value;
  }

  updateBookings(updatedList: any[]) {
    this.bookingsSubject.next(updatedList);
  }

  addBooking(newBooking: any) {
    const current = this.bookingsSubject.value;
    this.bookingsSubject.next([...current, newBooking]);
  }

  clearBookings() {
    this.bookingsSubject.next([]);
    localStorage.setItem('localBookings', JSON.stringify([]));
  }

  // --- CURRENT USER HELPER ---
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}