import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostRoomComponent } from './post-room.component';

describe('PostRoomComponent', () => {
  let component: PostRoomComponent;
  let fixture: ComponentFixture<PostRoomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PostRoomComponent]
    });
    fixture = TestBed.createComponent(PostRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
