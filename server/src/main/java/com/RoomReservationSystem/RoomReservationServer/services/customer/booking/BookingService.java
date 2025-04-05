package com.RoomReservationSystem.RoomReservationServer.services.customer.booking;

import com.RoomReservationSystem.RoomReservationServer.dto.ReservationDto;
import com.RoomReservationSystem.RoomReservationServer.dto.ReservationResponseDto;

public interface BookingService {
    boolean postReservation(ReservationDto reservationDto);
    ReservationResponseDto getAllReservationByUserId(Long userId, int pageNumber);
}
