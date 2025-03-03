import { Injectable } from '@nestjs/common';
import { User, UserRepository } from '@app/database';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne(id);
  }

  // async create(createUserDto: CreateUserDto): Promise<User> {
  //   const user = this.userRepository.create(createUserDto);
  //   await this.userRepository.persistAndFlush(user);
  //   return user;
  // }
}