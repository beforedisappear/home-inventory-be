import type { Types } from 'mongoose';

/**
 *  Augmentation Express.User — поля которые кладёт JwtStrategy.validate().
 *  Стратегия теперь получает мапленный UserResponseDto → есть строковое id.
 *  _id и sub оставлены как fallback (старый mongoose-doc, прямой JWT payload).
 */
declare global {
  namespace Express {
    interface User {
      id?: string;
      _id?: Types.ObjectId;
      sub?: string;
    }
  }
}

export {};
