package com.RoomReservationSystem.RoomReservationServer.controller.customer;

import com.RoomReservationSystem.RoomReservationServer.dto.BookingResponseDto;
import com.RoomReservationSystem.RoomReservationServer.services.customer.room.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer")
public class RoomController {
    private final RoomService roomService;

    @GetMapping("/rooms/{pageNumber}")
    public ResponseEntity<?> getAvailableRooms(@PathVariable int pageNumber){
        return ResponseEntity.ok(roomService.getAvailableRooms(pageNumber));
    }

    /**
     * GET /api/customer/rooms/{roomId}/bookings?date={date}
     */
    @GetMapping("/rooms/{roomId}/bookings")
    public ResponseEntity<List<BookingResponseDto>> getBookings(
            @PathVariable("roomId") Long roomId,
            @RequestParam("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<BookingResponseDto> bookings = new ArrayList<>();
        bookings = roomService.getBookings(roomId, date);

        return ResponseEntity.ok(bookings);
    }
}
