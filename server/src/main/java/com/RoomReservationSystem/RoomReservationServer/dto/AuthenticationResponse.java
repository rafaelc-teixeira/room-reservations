package com.RoomReservationSystem.RoomReservationServer.dto;

import com.RoomReservationSystem.RoomReservationServer.enums.UserRole;
import lombok.Data;

@Data
public class AuthenticationResponse {
    private String jwt;
    private Long userId;
    private UserRole userRole;
}
