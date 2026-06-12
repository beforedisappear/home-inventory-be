import { IsBoolean } from 'class-validator';

export class SentResponseDto {
  @IsBoolean()
  sent: boolean;
}
