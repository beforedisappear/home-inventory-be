import { UserResponseDto } from '../dto/user-response.dto';
import { UserDocument } from '../schemas/user.schema';

export class UserMapper {
  static toResponseDto(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
