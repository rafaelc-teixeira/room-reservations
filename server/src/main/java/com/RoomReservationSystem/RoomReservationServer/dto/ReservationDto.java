package com.RoomReservationSystem.RoomReservationServer.dto;

import com.RoomReservationSystem.RoomReservationServer.enums.ReservationStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ReservationDto {
    private Long id;

    private LocalDateTime checkInDate;
    private LocalDateTime checkOutDate;
    private Long price;
    private ReservationStatus reservationStatus;
    private Long roomId;
    private String roomType;
    private String roomName;
    private Long userId;
    private String username;
}
