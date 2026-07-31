import { Request, Response, NextFunction } from "express";
import { Event } from "../models/Event";
import { Booking } from "../models/Booking";
import { getRedisClient } from "../lib/redis";

const CACHE_TTL_SECONDS = 30;

// Helper to invalidate caches after mutation
async function invalidateEventCache(id?: string) {
  try {
    const redis = getRedisClient();
    if (redis.status !== "ready") return;
    await redis.del("events:all:active");
    if (id) await redis.del(`events:${id}`);
  } catch (e) {
    // Ignore cache errors
  }
}

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redis = getRedisClient();
    const cacheKey = "events:all:active";
    
    if (redis.status === "ready") {
      const cached = await redis.get(cacheKey);
      if (cached) return res.status(200).json(JSON.parse(cached));
    }

    const events = await Event.find({ isActive: true }).lean();
    
    // Compute dynamic dateSlots based on actual bookings
    const bookingsAgg = await Booking.aggregate([
      { $match: { bookingStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: { event: "$event", date: "$date", slotTime: "$slotTime" }, total: { $sum: "$numberOfGuests" } } }
    ]);

    const enrichedEvents = events.map(event => {
      const dateSlots: Record<string, any[]> = {};
      event.dates.forEach((date: string) => {
        dateSlots[date] = event.slots.map((slot: any) => {
          const matched = bookingsAgg.find(b => 
            b._id.event.toString() === event._id.toString() && 
            b._id.date === date && 
            b._id.slotTime === slot.time
          );
          return { ...slot, booked: matched ? matched.total : 0 };
        });
      });
      return { ...event, dateSlots };
    });

    const responseData = { success: true, count: enrichedEvents.length, data: enrichedEvents };

    if (redis.status === "ready") {
      await redis.set(cacheKey, JSON.stringify(responseData), "EX", CACHE_TTL_SECONDS);
    }
    
    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redis = getRedisClient();
    const cacheKey = `events:${req.params.id}`;

    if (redis.status === "ready") {
      const cached = await redis.get(cacheKey);
      if (cached) return res.status(200).json(JSON.parse(cached));
    }

    const event = await Event.findById(req.params.id).lean();
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    const bookingsAgg = await Booking.aggregate([
      { $match: { event: event._id, bookingStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: { date: "$date", slotTime: "$slotTime" }, total: { $sum: "$numberOfGuests" } } }
    ]);

    const dateSlots: Record<string, any[]> = {};
    event.dates.forEach((date: string) => {
      dateSlots[date] = event.slots.map((slot: any) => {
        const matched = bookingsAgg.find(b => b._id.date === date && b._id.slotTime === slot.time);
        return { ...slot, booked: matched ? matched.total : 0 };
      });
    });

    const responseData = { success: true, data: { ...event, dateSlots } };

    if (redis.status === "ready") {
      await redis.set(cacheKey, JSON.stringify(responseData), "EX", CACHE_TTL_SECONDS);
    }
    
    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.create(req.body);
    await invalidateEventCache();
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    await invalidateEventCache(req.params.id);
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }
    await invalidateEventCache(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
