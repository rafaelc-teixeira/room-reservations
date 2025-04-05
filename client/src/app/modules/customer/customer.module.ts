import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { NgZorroAntdModule } from 'src/app/NgZorroAntdModule';
import { FormsModule } from '@angular/forms';
import { ViewBookingsComponent } from './components/rooms/view-bookings/view-bookings.component';


@NgModule({
  declarations: [
    CustomerComponent,
    RoomsComponent,
    ViewBookingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CustomerRoutingModule,
    NgZorroAntdModule
  ]
})
export class CustomerModule { }
