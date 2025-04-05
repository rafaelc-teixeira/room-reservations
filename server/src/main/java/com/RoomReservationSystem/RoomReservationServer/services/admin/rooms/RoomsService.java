package com.RoomReservationSystem.RoomReservationServer.services.admin.rooms;

import com.RoomReservationSystem.RoomReservationServer.dto.RoomDto;
import com.RoomReservationSystem.RoomReservationServer.dto.RoomsResponseDto;

public interface RoomsService {
    boolean postRoom(RoomDto roomDto);
    RoomsResponseDto getAllRooms(int pageNumber);
    RoomDto getRoomById(Long id);
    boolean updateRoom(Long id, RoomDto roomDto);
    void deleteRoom(Long id);
}

