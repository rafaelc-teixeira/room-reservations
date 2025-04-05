package com.RoomReservationSystem.RoomReservationServer.services.auth;

import com.RoomReservationSystem.RoomReservationServer.dto.SignupRequest;
import com.RoomReservationSystem.RoomReservationServer.dto.UserDto;

public interface AuthService {
    UserDto createUser(SignupRequest signupRequest);
}
