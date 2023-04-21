import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
export class CreateUserDto {
  @ApiProperty({
    example: 'canh',
    description: 'username không được trùng nhau',
  })
  @IsNotEmpty()
  username: string;
  @ApiProperty({
    example: '12345678',
    description: 'mật khẩu phải ít nhất 8 kí tự',
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
