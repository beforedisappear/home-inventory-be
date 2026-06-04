import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { RedisService } from '@/infra/redis/redis.service';
import { MailService } from '@/libs/mail/mail.service';
import { SentResponseDto } from '@/shared/dto';

import { UserRepository } from './user.repository';
import {
  CreateUserDto,
  UpdateUserDto,
  RequestEmailChangeDto,
  ConfirmEmailChangeDto,
} from './dto';
import type { EmailChangePayload } from './interfaces';
import { UserMapper } from './mappers/user.mapper';

const EMAIL_CHANGE_TTL_SEC = 15 * 60;

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redis: RedisService,
    private readonly mail: MailService,
  ) {}

  async findById(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundException(`User not found`);

    return UserMapper.toResponseDto(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);
    return user ? UserMapper.toResponseDto(user) : null;
  }

  async findOrCreateByEmail(email: string) {
    const existing = await this.userRepository.findByEmail(email);

    if (existing) return UserMapper.toResponseDto(existing);

    const created = await this.userRepository.createByEmail(email);

    return UserMapper.toResponseDto(created);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepository.findByEmail(dto.email);

    if (existing)
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );

    const created = await this.userRepository.create(dto);

    return UserMapper.toResponseDto(created);
  }

  async update(id: string, dto: UpdateUserDto) {
    const updated = await this.userRepository.update(id, dto);

    if (!updated) throw new NotFoundException(`User ${id} not found`);

    return UserMapper.toResponseDto(updated);
  }

  async delete(id: string) {
    const deleted = await this.userRepository.delete(id);

    if (!deleted) throw new NotFoundException(`User ${id} not found`);

    return { id };
  }

  async requestEmailChange(
    userId: string,
    dto: RequestEmailChangeDto,
  ): Promise<SentResponseDto> {
    const { newEmail } = dto;

    const user = await this.findById(userId);

    if (user.email === newEmail)
      throw new BadRequestException('New email is the same as current');

    const taken = await this.userRepository.findByEmail(newEmail);

    if (taken) throw new ConflictException(`Email already taken`);

    const code = this.generateCode();

    const payload: EmailChangePayload = { newEmail, code };

    await this.redis.set(
      this.getEmailChangeKey(userId),
      JSON.stringify(payload),
      EMAIL_CHANGE_TTL_SEC,
    );

    await this.mail.send({
      to: newEmail,
      subject: 'Подтверждение смены email',
      template: 'email-change',
      context: {
        name: user.name,
        code,
        ttlMinutes: EMAIL_CHANGE_TTL_SEC / 60,
      },
    });

    return { sent: true };
  }

  async confirmEmailChange(userId: string, dto: ConfirmEmailChangeDto) {
    const { code } = dto;

    const redisKey = this.getEmailChangeKey(userId);

    const raw = await this.redis.get(redisKey);

    if (!raw)
      throw new BadRequestException(
        'Email change request not found or expired',
      );

    const payload = JSON.parse(raw) as EmailChangePayload;

    if (payload.code !== code)
      throw new BadRequestException('Invalid confirmation code');

    const taken = await this.userRepository.findByEmail(payload.newEmail);

    if (taken && taken._id.toString() !== userId) {
      await this.redis.del(redisKey);

      throw new ConflictException(`Email already taken`);
    }

    const updated = await this.userRepository.updateEmail(
      userId,
      payload.newEmail,
    );

    if (!updated) throw new NotFoundException(`User not found`);

    await this.redis.del(redisKey);

    return UserMapper.toResponseDto(updated);
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getEmailChangeKey(userId: string): string {
    return `email-change:${userId}`;
  }
}
