package com.RoomReservationSystem.RoomReservationServer.services.customer.room;

import com.RoomReservationSystem.RoomReservationServer.dto.BookingResponseDto;
import com.RoomReservationSystem.RoomReservationServer.dto.RoomsResponseDto;
import com.RoomReservationSystem.RoomReservationServer.entity.Reservation;
import com.RoomReservationSystem.RoomReservationServer.entity.Room;
import com.RoomReservationSystem.RoomReservationServer.enums.ReservationStatus;
import com.RoomReservationSystem.RoomReservationServer.repository.ReservationRepository;
import com.RoomReservationSystem.RoomReservationServer.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {
    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;

    public RoomsResponseDto getAvailableRooms(int pageNumber){
        Pageable pageable = PageRequest.of(pageNumber, 6);
        Page<Room> roomPage = roomRepository.findByAvailable(true, pageable);

        RoomsResponseDto roomsResponseDto = new RoomsResponseDto();
        roomsResponseDto.setPageNumber(roomPage.getPageable().getPageNumber());
        roomsResponseDto.setTotalPages(roomPage.getTotalPages());
        roomsResponseDto.setRoomDtoList(roomPage.stream().map(Room::getRoomDto).collect(Collectors.toList()));

        return roomsResponseDto;
    }

    public List<BookingResponseDto> getBookings(Long roomId, LocalDate dateParam) {
        // 1) Fetch only reservations with status = 1 for this room
        List<Reservation> reservations = reservationRepository.findByRoomIdAndReservationStatus(roomId, ReservationStatus.APPROVED);

        List<BookingResponseDto> result = new ArrayList<>();

        // 2) Convert times to HH:mm for start/end
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        // 3) Iterate over all reservations found
        for (Reservation reservation : reservations) {
            LocalDate checkInDay = reservation.getCheckInDate().toLocalDate();
            LocalDate checkOutDay = reservation.getCheckOutDate().toLocalDate();

            // -- If you want to use the incoming dateParam to further filter,
            // -- you could do something like:
            // if (checkOutDay.isBefore(dateParam)) continue; // skip if it ends before dateParam
            // if (checkInDay.isAfter(dateParam.plusMonths(1))) continue; // example of date range, etc.

            // 4) For each day from checkInDay to checkOutDay (inclusive):
            LocalDate current = checkInDay;
            while (!current.isAfter(checkOutDay)) {

                // Build a new BookingDTO
                BookingResponseDto dto = new BookingResponseDto();
                dto.setDate(current.toString()); // e.g. "2025-04-16"

                // We replicate your example exactly:
                // The startTime is always the checkIn time (HH:mm) for *every* day in the range
                // The endTime is always the checkOut time (HH:mm) for *every* day in the range
                String startTimeStr = reservation.getCheckInDate().minus(3, ChronoUnit.HOURS).toLocalTime().truncatedTo(ChronoUnit.MINUTES)
                        .format(timeFormatter);
                String endTimeStr = reservation.getCheckOutDate().minus(3, ChronoUnit.HOURS).toLocalTime().truncatedTo(ChronoUnit.MINUTES)
                        .format(timeFormatter);

                dto.setStartTime(startTimeStr);
                dto.setEndTime(endTimeStr);

                result.add(dto);

                current = current.plusDays(1);
            }
        }

        return result;
    }

}
