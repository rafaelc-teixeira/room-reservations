package com.RoomReservationSystem.RoomReservationServer.dto;

import lombok.Data;

@Data
public class BookingResponseDto {

    private String date;
    private String startTime;
    private String endTime;

}
