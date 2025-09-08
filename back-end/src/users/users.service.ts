import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

@Injectable()
export class UsersService {
  private users: User[] = Array.from({ length: 100 }).map((_, i) => ({
    id: i + 1,
    name: `Kullanıcı${i + 1}`,
    username: `user${i + 1}`,
    email: `user${i + 1}@example.com`,
  }));

  create(createUserDto: CreateUserDto): User {
    const newUser: User = {
      id: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
      name: createUserDto.name,
      username: createUserDto.username,
      email: createUserDto.email,
    };
    this.users.push(newUser);
    return newUser;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  update(id: number, updateUserDto: UpdateUserDto): User | undefined {
    const user = this.findOne(id);
    if (user) Object.assign(user, updateUserDto);
    return user;
  }

  remove(id: number): { deleted: boolean } {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return { deleted: this.users.length < initialLength };
  }
}
