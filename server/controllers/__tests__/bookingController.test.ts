import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBooking } from '../bookingController';
import { Event } from '../../models/Event';
import { Booking } from '../../models/Booking';

// Mock dependencies
vi.mock('../../models/Event');
vi.mock('../../models/Booking');
vi.mock('../../models/Waitlist');
vi.mock('../../lib/redis', () => ({
  acquireSeatLock: vi.fn().mockResolvedValue(true),
  releaseSeatLock: vi.fn().mockResolvedValue(true),
  SEAT_LOCK_TTL_SECONDS: 600
}));
vi.mock('../../lib/queues', () => ({
  addNotificationJob: vi.fn().mockResolvedValue(true),
  addQRGenerationJob: vi.fn().mockResolvedValue(true),
  scheduleSeatRelease: vi.fn().mockResolvedValue(true)
}));

describe('bookingController - createBooking', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;
  
  beforeEach(() => {
    mockReq = {
      body: {
        event: 'event_id_123',
        date: '2026-08-06',
        slotTime: '11:00 AM',
        guestDetails: { fullName: 'Test User' },
        numberOfGuests: 5,
        totalAmount: 1799
      },
      user: { _id: 'user_id_456' }
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    
    mockNext = vi.fn();
    
    vi.clearAllMocks();
  });

  it('should waitlist if requested guests exceed available capacity', async () => {
    const mockEvent = {
      _id: 'event_id_123',
      isActive: true,
      dates: ['2026-08-06'],
      slots: [{ time: '11:00 AM', capacity: 10, booked: 8 }], // Only 2 remaining
    };
    
    (Event.findById as any).mockResolvedValue(mockEvent);

    const WaitlistMock = (await import('../../models/Waitlist')).Waitlist;
    (WaitlistMock.findOne as any).mockResolvedValue(null);
    (WaitlistMock.countDocuments as any).mockResolvedValue(0);
    (WaitlistMock.create as any).mockResolvedValue(true);

    await createBooking(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      waitlisted: true,
      error: "Slot is full. You have been added to the waitlist."
    }));
    expect(Booking.create).not.toHaveBeenCalled();
  });

  it('should successfully reserve seats if capacity is available', async () => {
    const mockEvent = {
      _id: 'event_id_123',
      isActive: true,
      dates: ['2026-08-06'],
      slots: [{ time: '11:00 AM', capacity: 50, booked: 5 }], // 45 remaining
    };
    
    (Event.findById as any).mockResolvedValue(mockEvent);
    
    // Mock the findOneAndUpdate for atomic locking
    const updatedEvent = { ...mockEvent };
    updatedEvent.slots[0].booked = 10;
    (Event.findOneAndUpdate as any).mockResolvedValue(updatedEvent);
    
    (Booking.create as any).mockResolvedValue([{ _id: 'new_booking_id', bookingStatus: 'Confirmed' }]);

    await createBooking(mockReq, mockRes, mockNext);

    console.log("Response Status:", mockRes.status.mock.calls);
    console.log("Response JSON:", mockRes.json.mock.calls);

    expect(Event.findOneAndUpdate).toHaveBeenCalled();
    expect(Booking.create).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });
});
