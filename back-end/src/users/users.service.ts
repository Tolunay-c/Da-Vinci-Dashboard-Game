// backend/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as fs from 'fs';
import * as path from 'path';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  gender: 'male' | 'female';
}

@Injectable()
export class UsersService {
  private readonly dataFile = path.join(process.cwd(), 'data', 'users.json');
  private users: User[] = [];

  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    try {
      // data klasörü yoksa oluştur
      const dataDir = path.dirname(this.dataFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // JSON dosyası varsa yükle
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        this.users = JSON.parse(data);
        console.log('✅ Users JSON dosyasından yüklendi');
      } else {
        // İlk kez çalışıyorsa 100 kullanıcı oluştur
        this.generateInitialUsers();
        this.saveUsers();
        console.log('✅ 100 kullanıcı oluşturuldu ve kaydedildi');
      }
    } catch (error) {
      console.error('❌ Users yüklenirken hata:', error);
      this.generateInitialUsers();
    }
  }

  private generateInitialUsers() {
    this.users = Array.from({ length: 100 }).map((_, i) => ({
      id: i + 1,
      name: `Kullanıcı${i + 1}`,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      gender: Math.random() > 0.5 ? 'male' : 'female',
    }));
  }

  private saveUsers() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.users, null, 2));
      console.log('💾 Users kaydedildi');
    } catch (error) {
      console.error('❌ Users kaydedilirken hata:', error);
    }
  }

  // CRUD Operasyonları
  create(createUserDto: CreateUserDto): User {
    const newUser: User = {
      id: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
      name: createUserDto.name,
      username: createUserDto.username,
      email: createUserDto.email,
      gender: createUserDto.gender || (Math.random() > 0.5 ? 'male' : 'female'),
    };
    this.users.push(newUser);
    this.saveUsers(); // Kaydet!
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
    if (user) {
      Object.assign(user, updateUserDto);
      this.saveUsers(); // Kaydet!
    }
    return user;
  }

  remove(id: number): { deleted: boolean } {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    const deleted = this.users.length < initialLength;
    if (deleted) this.saveUsers(); // Kaydet!
    return { deleted };
  }
}
