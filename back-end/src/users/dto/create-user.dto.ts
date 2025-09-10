// dto/create-user.dto.ts
export class CreateUserDto {
  name: string;
  username: string;
  email: string;
  gender?: 'male' | 'female'; // Opsiyonel, yoksa rastgele atanır
}
