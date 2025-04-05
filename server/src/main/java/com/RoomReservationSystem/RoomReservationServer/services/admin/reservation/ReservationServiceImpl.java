package com.RoomReservationSystem.RoomReservationServer.services.admin.reservation;

import com.RoomReservationSystem.RoomReservationServer.dto.ReservationResponseDto;
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

import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService{
    private final ReservationRepository reservationRepository;

    private final RoomRepository roomRepository;
    public static final int SEARCH_RESULT_PER_PAGE = 4;

    public ReservationResponseDto getAllReservations(int pageNumber){
        Pageable pageable = PageRequest.of(pageNumber, SEARCH_RESULT_PER_PAGE);
        Page<Reservation> reservationPage = reservationRepository.findAll(pageable);
        ReservationResponseDto reservationResponseDto = new ReservationResponseDto();
        reservationResponseDto.setReservationDtoList(reservationPage.stream().map(Reservation::getReservationDto).collect(Collectors.toList()));

        reservationResponseDto.setPageNumber(reservationPage.getPageable().getPageNumber());
        reservationResponseDto.setTotalPages(reservationPage.getTotalPages());

        return reservationResponseDto;
    }

    public boolean changeReservationStatus(Long id, String status){
        Optional<Reservation> optionalReservation = reservationRepository.findById(id);
        if(optionalReservation.isPresent()){
            Reservation existingReservation = optionalReservation.get();

            if(Objects.equals(status, "Approve")){
                existingReservation.setReservationStatus(ReservationStatus.APPROVED);
            }else{
                existingReservation.setReservationStatus(ReservationStatus.REJECTED);
            }

            reservationRepository.save(existingReservation);

            return true;
        }
        return false;
    }
}
