import { Injectable } from '@nestjs/common';

import { InjectRedis } from '@nestjs-modules/ioredis';
import type { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async get(key: string) {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttlSec?: number) {
    if (ttlSec) {
      await this.redis.set(key, value, 'EX', ttlSec);
    } else {
      await this.redis.set(key, value);
    }
  }

  async setNx(key: string, value: string, ttlSec: number) {
    const result = await this.redis.set(key, value, 'EX', ttlSec, 'NX');
    return result === 'OK';
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async getdel(key: string) {
    return this.redis.getdel(key);
  }

  async exists(key: string) {
    const n = await this.redis.exists(key);
    return n === 1;
  }

  async ttl(key: string) {
    return this.redis.ttl(key);
  }

  async expire(key: string, ttlSec: number) {
    return this.redis.expire(key, ttlSec);
  }

  async incr(key: string) {
    return this.redis.incr(key);
  }

  async incrby(key: string, delta: number) {
    return this.redis.incrby(key, delta);
  }

  async hgetall(key: string) {
    return this.redis.hgetall(key);
  }

  async hget(key: string, field: string) {
    return this.redis.hget(key, field);
  }

  async hset(key: string, entries: Record<string, string | number>) {
    return this.redis.hset(key, entries);
  }

  async hincrby(key: string, field: string, delta: number) {
    return this.redis.hincrby(key, field, delta);
  }

  async hdel(key: string, ...fields: string[]) {
    return this.redis.hdel(key, ...fields);
  }

  // перезапись всего hash атомарно: DEL + HSET в одной транзакции
  async hreplace(key: string, entries: Record<string, string | number>) {
    const pipeline = this.redis.multi();

    pipeline.del(key);

    if (Object.keys(entries).length > 0) {
      pipeline.hset(key, entries);
    }

    await pipeline.exec();
  }

  /** Скан по паттерну (SCAN, без блокировки) */
  async keys(pattern: string) {
    const stream = this.redis.scanStream({ match: pattern, count: 100 });
    const result: string[] = [];

    return new Promise<string[]>((resolve, reject) => {
      stream.on('data', (chunk: string[]) => result.push(...chunk));
      stream.on('end', () => resolve(result));
      stream.on('error', reject);
    });
  }
}
