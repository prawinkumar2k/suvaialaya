import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBooking } from '../bookingController';
import { Event } from '../../models/Event';
import { Booking } from '../../models/Booking';

// Mock dependencies
vi.mock('../../models/Event');
vi.mock('../../models/Booking');
vi.mock('../../services/emailService', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue(true)
}));

describe('bookingController', () => {
  describe('createBooking - Capacity Locking Logic', () => {
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

    it('should reject booking if requested guests exceed available capacity', async () => {
      // Setup mock event with only 2 seats remaining (Capacity 10, Booked 8)
      const mockEvent = {
        _id: 'event_id_123',
        dates: ['2026-08-06'],
        slots: [{ time: '11:00 AM', capacity: 10, booked: 8 }],
        save: vi.fn()
      };
      
      (Event.findById as any).mockResolvedValue(mockEvent);

      await createBooking(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Not enough seats available in this slot"
      });
      expect(mockEvent.save).not.toHaveBeenCalled();
      expect(Booking.create).not.toHaveBeenCalled();
    });

    it('should successfully reserve seats if capacity is available', async () => {
      // Setup mock event with 5 seats remaining (Capacity 10, Booked 5)
      const mockEvent = {
        _id: 'event_id_123',
        dates: ['2026-08-06'],
        slots: [{ time: '11:00 AM', capacity: 10, booked: 5 }],
        save: vi.fn()
      };
      
      (Event.findById as any).mockResolvedValue(mockEvent);
      (Booking.create as any).mockResolvedValue({ _id: 'new_booking_id', bookingStatus: 'Confirmed' });

      await createBooking(mockReq, mockRes, mockNext);

      // Verify seats were locked
      expect(mockEvent.slots[0].booked).toBe(10); // 5 previously booked + 5 requested
      expect(mockEvent.save).toHaveBeenCalled();
      
      // Verify Booking was created
      expect(Booking.create).toHaveBeenCalledWith(expect.objectContaining({
        numberOfGuests: 5,
        bookingStatus: 'Confirmed'
      }));
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });
});
