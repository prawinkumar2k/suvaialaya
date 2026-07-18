import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addNotificationJob, scheduleSeatRelease } from '../../server/lib/queues';
import { acquireSeatLock, releaseSeatLock } from '../../server/lib/redis';

// Mock the Redis client
const mockRedisClient = {
  status: 'ready',
  set: vi.fn(),
  del: vi.fn(),
  ping: vi.fn().mockResolvedValue('PONG')
};

vi.mock('../../server/lib/redis', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    redis: mockRedisClient,
  };
});

describe('Chaos Engineering: Redis Infrastructure Failure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedisClient.status = 'ready'; // Reset to healthy
  });

  it('should gracefully skip background notification jobs without crashing when Redis is down', async () => {
    // 💥 INJECT CHAOS: Redis suddenly goes offline
    mockRedisClient.status = 'end';
    
    // Attempt to add a job
    const result = await addNotificationJob('email', { 
      to: 'customer@example.com', 
      subject: 'Test', 
      body: 'Body' 
    });
    
    // Expect the system to NOT crash, but to bypass the queue
    expect(result).toBeUndefined();
  });

  it('should fail critical seat release jobs explicitly when Redis is down to prevent zombie states', async () => {
    // 💥 INJECT CHAOS: Redis suddenly goes offline during a timeout cleanup
    mockRedisClient.status = 'error';

    try {
      await scheduleSeatRelease('booking123');
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      // The system MUST throw an error for critical business logic if the queue is dead
      expect(error.message).toContain('Redis offline');
    }
  });

  it('should prevent seat locking if Redis is unreachable (prevent double-booking split brain)', async () => {
    // 💥 INJECT CHAOS: Redis connection hangs or fails
    mockRedisClient.set.mockRejectedValueOnce(new Error('Redis connection timeout'));

    const lockResult = await acquireSeatLock('event1', '2026-08-06', '10:00 AM', 'user1', 2);
    
    // The lock MUST return false to fail the booking, rather than assuming it's locked
    expect(lockResult).toBe(false);
  });
});
