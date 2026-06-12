import {
  IsDate,
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserResponseDto {
  @IsMongoId()
  id: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
