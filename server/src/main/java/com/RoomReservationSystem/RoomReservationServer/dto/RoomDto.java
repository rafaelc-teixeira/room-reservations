package com.RoomReservationSystem.RoomReservationServer.dto;

import lombok.Data;

@Data
public class RoomDto {
    private Long id;
    private String name;
    private String type;
    private Long price;
    private boolean available;
}
