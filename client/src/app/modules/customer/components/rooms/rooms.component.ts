import { Component } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CustomerService } from '../../service/customer.service';
import { UserStorageService } from 'src/app/auth/services/storage/user-storage.service';
import { forkJoin } from "rxjs"

interface BookedTimeSlot {
  date: string
  startTime: string
  endTime: string
}

interface Room {
  id: number
  name: string
  type: string
  price: number
  isFullyBooked?: boolean
  bookedHours?: string[]
}

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent {
  currentPage = 1
  rooms: Room[] = []
  total: any
  loading = false
  isVisibleMiddle = false
  date: Date[] = []
  selectedRoomId: number
  id: number

  // Time picker properties
  startTime: Date = new Date()
  endTime: Date = new Date()
  timeError = false
  bookingConflictError = false

  // New properties for time slot booking
  bookWholeDay = false
  selectedDate: Date | null = null
  bookedTimeSlots: BookedTimeSlot[] = []
  timeSlots: string[] = []
  isSelectedDateFullyBooked = false

  constructor(
    private customerService: CustomerService,
    private message: NzMessageService,
  ) {
    // Set default times (00:00 and 23:59)
    this.startTime.setHours(0, 0, 0)
    this.endTime.setHours(23, 59, 0)

    // Generate time slots for visualization (hourly slots)
    this.generateTimeSlots()
  }

  ngOnInit(): void {
    this.getRooms()
  }

  generateTimeSlots() {
    this.timeSlots = []
    for (let hour = 0; hour < 24; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, "0")}:00`)
    }
  }

  getRooms() {
    this.loading = true
    this.customerService.getRooms(this.currentPage - 1).subscribe((res) => {
      const roomsData = res.roomDtoList

      // Get today's date in the format required by the API
      const today = new Date()
      const formattedToday = this.formatDateForApi(today)

      // Create an array of observables for each room's availability
      const availabilityRequests = roomsData.map((room) =>
        this.customerService.getBookedTimeSlots(room.id, formattedToday),
      )

      // Execute all requests in parallel
      forkJoin(availabilityRequests).subscribe(
        (availabilityResults) => {
          // Process each room with its availability data
          this.rooms = roomsData.map((room, index) => {
            const bookedSlots = availabilityResults[index]

            // Check if room is fully booked
            const isFullyBooked = this.checkIfFullyBooked(bookedSlots)

            // Get summary of booked hours
            const bookedHours = this.getBookedHoursSummary(bookedSlots)

            return {
              ...room,
              isFullyBooked,
              bookedHours,
            }
          })

          this.total = res.totalPages * 1
          this.loading = false
        },
        (error) => {
          console.error("Error fetching room availability:", error)
          this.rooms = roomsData
          this.total = res.totalPages * 1
          this.loading = false
        },
      )
    })
  }

  checkIfFullyBooked(bookedSlots: BookedTimeSlot[]): boolean {
    // Check if there's a booking that covers the entire day
    return bookedSlots.some((slot) => slot.startTime === "00:00" && slot.endTime === "23:59")
  }

  getBookedHoursSummary(bookedSlots: BookedTimeSlot[]): string[] {
    if (!bookedSlots || bookedSlots.length === 0) {
      return []
    }

    // Create a simplified representation of booked hours
    return bookedSlots.map((slot) => {
      const start = slot.startTime.substring(0, 5)
      const end = slot.endTime.substring(0, 5)
      return `${start}-${end}`
    })
  }

  pageIndexChange(value: any) {
    this.currentPage = value
    this.getRooms()
  }

  showModalMiddle(id: number): void {
    this.id = id
    this.isVisibleMiddle = true
    this.bookingConflictError = false

    // Reset booking options
    this.bookWholeDay = false
    this.selectedDate = new Date() // Default to today
    this.isSelectedDateFullyBooked = false

    // Reset times to default when opening modal
    this.startTime = new Date()
    this.endTime = new Date()
    this.startTime.setHours(9, 0, 0) // Default to business hours
    this.endTime.setHours(17, 0, 0)
    this.timeError = false

    // Set date picker to today
    this.date = [new Date()]

    // Fetch availability for today immediately
    this.fetchBookedTimeSlots(id, this.selectedDate)
  }

  handleCancelMiddle(): void {
    this.isVisibleMiddle = false
  }

  onDateChange(dates: Date[]): void {
    if (dates && dates.length > 0) {
      // If single day is selected, fetch booked time slots for that day
      if (
        dates.length === 1 ||
        (dates.length === 2 &&
          dates[0].getDate() === dates[1].getDate() &&
          dates[0].getMonth() === dates[1].getMonth() &&
          dates[0].getFullYear() === dates[1].getFullYear())
      ) {
        this.selectedDate = new Date(dates[0])
        this.fetchBookedTimeSlots(this.id, this.selectedDate)
      } else if (dates.length === 2) {
        // If multiple days are selected, automatically set to whole day booking
        // this.bookWholeDay = true
        // this.selectedDate = null

        // Check if any of the selected days are fully booked
        this.checkMultipleDaysAvailability(dates[0], dates[1])
      }
    }
  }

  checkMultipleDaysAvailability(startDate: Date, endDate: Date): void {
    const dates: Date[] = []
    const currentDate = new Date(startDate)

    // Generate array of all dates in the range
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Check availability for each date
    const availabilityRequests = dates.map((date) =>
      this.customerService.getBookedTimeSlots(this.id, this.formatDateForApi(date)),
    )

    forkJoin(availabilityRequests).subscribe(
      (results) => {
        // Check if any day is fully booked
        const hasFullyBookedDay = results.some((bookedSlots) => this.checkIfFullyBooked(bookedSlots))

        this.isSelectedDateFullyBooked = hasFullyBookedDay

        if (hasFullyBookedDay) {
          this.message.warning("One or more selected days are fully booked", { nzDuration: 5000 })
        }
      },
      (error) => {
        console.error("Error checking multiple days availability:", error)
      },
    )
  }

  onWholeBookingChange(checked: boolean): void {
    if (checked) {
      // Set times to whole day
      this.startTime = new Date()
      this.endTime = new Date()
      this.startTime.setHours(0, 0, 0)
      this.endTime.setHours(23, 59, 0)
    } else {
      // Set to business hours by default
      this.startTime = new Date()
      this.endTime = new Date()
      this.startTime.setHours(9, 0, 0)
      this.endTime.setHours(17, 0, 0)

      // If a date is selected, check availability
      if (this.selectedDate) {
        this.onTimeChange()
      }
    }
  }

  fetchBookedTimeSlots(roomId: number, date: Date): void {
    const formattedDate = this.formatDateForApi(date)
    this.customerService.getBookedTimeSlots(roomId, formattedDate).subscribe(
      (slots: BookedTimeSlot[]) => {
        this.bookedTimeSlots = slots

        // Check if the day is fully booked
        this.isSelectedDateFullyBooked = this.checkIfFullyBooked(slots)

        if (this.isSelectedDateFullyBooked) {
          this.message.warning("This room is fully booked for the selected date", { nzDuration: 5000 })
        } else {
          // Find available time slot
          this.findAvailableTimeSlot()
        }

        // Check if current selection has conflicts
        this.onTimeChange()
      },
      (error) => {
        console.error("Error fetching booked time slots:", error)
        this.message.error("Failed to fetch room availability")
      },
    )
  }

  findAvailableTimeSlot(): void {
    if (this.bookedTimeSlots.length === 0) {
      // If no bookings, default to business hours
      this.startTime.setHours(9, 0, 0)
      this.endTime.setHours(17, 0, 0)
      return
    }

    // Find the first available 2-hour slot
    for (let hour = 8; hour < 20; hour++) {
      const startTimeString = `${hour.toString().padStart(2, "0")}:00`
      const endTimeString = `${(hour + 2).toString().padStart(2, "0")}:00`

      if (!this.isTimeRangeBooked(startTimeString, endTimeString)) {
        // Found an available slot
        this.startTime = new Date(this.selectedDate)
        this.startTime.setHours(hour, 0, 0)

        this.endTime = new Date(this.selectedDate)
        this.endTime.setHours(hour + 2, 0, 0)

        return
      }
    }

    // If no 2-hour slot found, try to find any available slot
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

        if (!this.isTimeSlotBooked(timeString)) {
          // Found an available time
          this.startTime = new Date(this.selectedDate)
          this.startTime.setHours(hour, minute, 0)

          // Set end time to 1 hour later or next available slot
          let endHour = hour
          let endMinute = minute + 60

          if (endMinute >= 60) {
            endHour += Math.floor(endMinute / 60)
            endMinute = endMinute % 60
          }

          if (endHour >= 24) {
            endHour = 23
            endMinute = 59
          }

          this.endTime = new Date(this.selectedDate)
          this.endTime.setHours(endHour, endMinute, 0)

          return
        }
      }
    }
  }

  formatDateForApi(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
  }

  isTimeSlotBooked(timeSlot: string): boolean {
    if (!this.bookedTimeSlots || this.bookedTimeSlots.length === 0) {
      return false
    }

    const [hours, minutes] = timeSlot.split(":").map(Number)
    const slotTime = hours * 60 + minutes

    return this.bookedTimeSlots.some((slot) => {
      const startParts = slot.startTime.split(":").map(Number)
      const endParts = slot.endTime.split(":").map(Number)

      const startMinutes = startParts[0] * 60 + startParts[1]
      const endMinutes = endParts[0] * 60 + endParts[1]

      return slotTime >= startMinutes && slotTime < endMinutes
    })
  }

  isTimeRangeBooked(startTimeStr: string, endTimeStr: string): boolean {
    if (!this.bookedTimeSlots || this.bookedTimeSlots.length === 0) {
      return false
    }

    const [startHours, startMinutes] = startTimeStr.split(":").map(Number)
    const [endHours, endMinutes] = endTimeStr.split(":").map(Number)

    const rangeStartMinutes = startHours * 60 + startMinutes
    const rangeEndMinutes = endHours * 60 + endMinutes

    // Check if any booked slot overlaps with this range
    return this.bookedTimeSlots.some((slot) => {
      const slotStartParts = slot.startTime.split(":").map(Number)
      const slotEndParts = slot.endTime.split(":").map(Number)

      const slotStartMinutes = slotStartParts[0] * 60 + slotStartParts[1]
      const slotEndMinutes = slotEndParts[0] * 60 + slotEndParts[1]

      // Check for any overlap
      return rangeStartMinutes < slotEndMinutes && rangeEndMinutes > slotStartMinutes
    })
  }

  hasBookingConflict(): boolean {
    if (this.bookWholeDay || !this.selectedDate || this.bookedTimeSlots.length === 0) {
      return false
    }

    const startMinutes = this.startTime.getHours() * 60 + this.startTime.getMinutes()
    const endMinutes = this.endTime.getHours() * 60 + this.endTime.getMinutes()

    return this.bookedTimeSlots.some((slot) => {
      const slotStartParts = slot.startTime.split(":").map(Number)
      const slotEndParts = slot.endTime.split(":").map(Number)

      const slotStartMinutes = slotStartParts[0] * 60 + slotStartParts[1]
      const slotEndMinutes = slotEndParts[0] * 60 + slotEndParts[1]

      // Check if there's any overlap between the time ranges
      return startMinutes < slotEndMinutes && endMinutes > slotStartMinutes
    })
  }

  onTimeChange(): void {
    this.validateTimeSelection()
    this.bookingConflictError = this.hasBookingConflict()
  }

  // Disable hours for start time based on booked slots
  disabledStartHours = (): number[] => {
    if (this.bookWholeDay || !this.selectedDate || this.bookedTimeSlots.length === 0) {
      return []
    }

    const fullyBookedHours: number[] = []

    for (let hour = 0; hour < 24; hour++) {
      // Check if all 4 quarters of this hour are booked
      const allQuartersBooked = [0, 15, 30, 45].every((minute) => {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        return this.isTimeSlotBooked(timeString)
      })

      if (allQuartersBooked) {
        fullyBookedHours.push(hour)
      }
    }

    return fullyBookedHours
  }

  // Disable minutes for start time based on booked slots
  disabledStartMinutes = (hour: number): number[] => {
    console.log(hour);
    if (this.bookWholeDay || !this.selectedDate || this.bookedTimeSlots.length === 0) {
      return []
    }

    const bookedMinutes: number[] = []

    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      if (this.isTimeSlotBooked(timeString)) {
        bookedMinutes.push(minute)
      }
    }

    return bookedMinutes
  }

  // Disable hours for end time based on start time and booked slots
  disabledEndHours = (): number[] => {
    if (!this.startTime) return []

    const hours = []
    // Hours before start time are disabled
    for (let i = 0; i < this.startTime.getHours(); i++) {
      hours.push(i)
    }

    // Add hours that are fully booked after start time
    if (!this.bookWholeDay && this.selectedDate && this.bookedTimeSlots.length > 0) {
      const startHour = this.startTime.getHours()

      for (let hour = startHour + 1; hour < 24; hour++) {
        // Check if all 4 quarters of this hour are booked
        const allQuartersBooked = [0, 15, 30, 45].every((minute) => {
          const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
          return this.isTimeSlotBooked(timeString)
        })

        if (allQuartersBooked) {
          hours.push(hour)
        }
      }
    }

    return hours
  }

  // Disable minutes for end time based on start time and booked slots
  disabledEndMinutes = (hour: number): number[] => {
    const minutes = []

    // If same hour as start time, disable minutes before start time
    if (hour === this.startTime.getHours()) {
      for (let i = 0; i < this.startTime.getMinutes(); i++) {
        minutes.push(i)
      }
    }

    // Add minutes that are booked
    if (!this.bookWholeDay && this.selectedDate && this.bookedTimeSlots.length > 0) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Skip minutes already disabled due to start time
        if (hour === this.startTime.getHours() && minute < this.startTime.getMinutes()) {
          continue
        }

        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        if (this.isTimeSlotBooked(timeString)) {
          minutes.push(minute)
        }
      }
    }

    return minutes
  }

  // Validate time selection
  private validateTimeSelection(): boolean {
    if (!this.startTime || !this.endTime) return false

    const startMinutes = this.startTime.getHours() * 60 + this.startTime.getMinutes()
    const endMinutes = this.endTime.getHours() * 60 + this.endTime.getMinutes()

    const isValid = startMinutes < endMinutes
    this.timeError = !isValid
    return isValid
  }

  handleOkMiddle(): void {
    // Validate time selection
    if (!this.validateTimeSelection()) {
      return
    }

    // Check for booking conflicts
    if (!this.bookWholeDay && this.hasBookingConflict()) {
      this.bookingConflictError = true
      return
    }

    // Check if the day is fully booked
    if (this.isSelectedDateFullyBooked) {
      this.message.error("This room is fully booked for the selected date")
      return
    }

    // Format the date and time for booking
    let checkInDate, checkOutDate

    if (this.bookWholeDay) {
      // Whole day booking
      checkInDate = new Date(this.date[0])
      checkInDate.setHours(0, 0, 0)

      checkOutDate = new Date(this.date[1] || this.date[0])
      checkOutDate.setHours(23, 59, 0)
    } else {
      // Time slot booking
      checkInDate = new Date(this.date[0])
      checkInDate.setHours(this.startTime.getHours(), this.startTime.getMinutes(), 0)

      checkOutDate = new Date(this.date[1])
      checkOutDate.setHours(this.endTime.getHours(), this.endTime.getMinutes(), 0)
    }

    const obj = {
      userId: UserStorageService.getUserId(),
      roomId: this.id,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      isWholeDay: this.bookWholeDay,
    }

    console.log(obj)
    this.customerService.bookRoom(obj).subscribe(
      (res) => {
        this.message.success(`Request submitted for approval!`, { nzDuration: 5000 })
        this.isVisibleMiddle = false

        // Refresh rooms to update availability
        this.getRooms()
      },
      (error) => {
        this.message.error(`${error.error}`, { nzDuration: 5000 })
      },
    )
  }
}
