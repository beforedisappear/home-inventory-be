import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  create(data: CreateUserDto) {
    return this.userModel.create(data);
  }

  createByEmail(email: string) {
    return this.userModel.create({ email });
  }

  update(id: string, data: UpdateUserDto) {
    // { new: true } → вернуть документ ПОСЛЕ апдейта, а не до
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  updateEmail(id: string, email: string) {
    return this.userModel
      .findByIdAndUpdate(id, { email }, { new: true })
      .exec();
  }

  delete(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
