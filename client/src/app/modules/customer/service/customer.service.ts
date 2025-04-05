import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserStorageService } from 'src/app/auth/services/storage/user-storage.service';

const BASIC_URL = 'http://localhost:8080/';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: HttpClient) {}

  getRooms(pageNumber: any): Observable<any> {
    return this.http.get(BASIC_URL + `api/customer/rooms/${pageNumber}`, {
      headers: this.createAuthorizationHeader(),
    });
  }

  bookRoom(bookingDto: any): Observable<any> {
    console.log("Booking Room");
    console.log(bookingDto)
    return this.http.post(BASIC_URL + `api/customer/book`, bookingDto, {
      headers: this.createAuthorizationHeader(),
    });
  }

  getMyBookings(pageNumber: any): Observable<any> {
    const userId = UserStorageService.getUserId();
    return this.http.get(BASIC_URL + `api/customer/bookings/${userId}/${pageNumber}`, {
      headers: this.createAuthorizationHeader(),
    });
  }

  createAuthorizationHeader() {
    let authHeaders: HttpHeaders = new HttpHeaders();
    return authHeaders.set(
      'Authorization',
      'Bearer ' + UserStorageService.getToken()
    );
  }

  getBookedTimeSlots(roomId: number, date: string): Observable<any> {
    console.log("Getting Booked Time Slots");
    return this.http.get<any>(BASIC_URL + `api/customer/rooms/${roomId}/bookings?date=${date}`, {
      headers: this.createAuthorizationHeader(),
    });
  }

}
