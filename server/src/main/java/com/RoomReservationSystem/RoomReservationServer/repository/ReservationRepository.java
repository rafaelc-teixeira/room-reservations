package com.RoomReservationSystem.RoomReservationServer.repository;

import com.RoomReservationSystem.RoomReservationServer.entity.Reservation;
import com.RoomReservationSystem.RoomReservationServer.enums.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Page<Reservation> findAllByUserId(Pageable pageable, Long userId);
    List<Reservation> findByRoomIdAndReservationStatus(Long roomId, ReservationStatus reservationStatus);

}
