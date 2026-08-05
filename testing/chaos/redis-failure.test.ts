import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addNotificationJob, scheduleSeatRelease } from '../../server/lib/queues';
import { acquireSeatLock, releaseSeatLock } from '../../server/lib/redis';

// Mock the Redis client using vi.hoisted
const mockRedisClient = vi.hoisted(() => ({
  status: 'ready',
  set: vi.fn(),
  del: vi.fn(),
  ping: vi.fn().mockResolvedValue('PONG')
}));

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

  it('should bypass seat release jobs when Redis is down', async () => {
    // 💥 INJECT CHAOS: Redis suddenly goes offline during a timeout cleanup
    mockRedisClient.status = 'error';

    const result = await scheduleSeatRelease('booking123');
    expect(result).toBeUndefined();
  });

  it('should allow seat locking if Redis is unreachable for local dev fallback', async () => {
    // 💥 INJECT CHAOS: Redis connection hangs or fails
    mockRedisClient.set.mockRejectedValueOnce(new Error('Redis connection timeout'));

    const lockResult = await acquireSeatLock('event1', '2026-08-06', '10:00 AM', 'user1', 2);
    
    // The lock MUST return true to allow booking when Redis is offline
    expect(lockResult).toBe(true);
  });
});
