import type { Types } from 'mongoose';

/**
 *  Augmentation Express.User — поля которые кладёт JwtStrategy.validate().
 *  Сейчас стратегия возвращает Mongoose-документ → _id.
 *  Если перейдём на чистый payload — будет sub.
 */
declare global {
  namespace Express {
    interface User {
      _id?: Types.ObjectId;
      sub?: string;
    }
  }
}

export {};
