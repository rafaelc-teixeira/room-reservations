package com.RoomReservationSystem.RoomReservationServer.services.customer.room;

import com.RoomReservationSystem.RoomReservationServer.dto.BookingResponseDto;
import com.RoomReservationSystem.RoomReservationServer.dto.RoomsResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface RoomService {
    RoomsResponseDto getAvailableRooms(int pageNumber);
    List<BookingResponseDto> getBookings(Long roomId, LocalDate dateParam);
}
