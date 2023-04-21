import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
export class LoginDto {
  @ApiProperty({
    example: 'canh',
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
