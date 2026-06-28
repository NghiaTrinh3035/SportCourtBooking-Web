import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export type UserRole = 'CUSTOMER' | 'OWNER' | 'STAFF' | 'ADMIN';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface LoginResponse extends User {
  token: string;
}

export class RegisterRequest {
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @Length(2, 100, { message: 'Họ và tên từ 2 đến 100 ký tự' })
  fullName: string = '';

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string = '';

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @Length(8, 100, { message: 'Mật khẩu phải từ 8 đến 100 ký tự' })
  password: string = '';

  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  confirmPassword: string = '';

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Length(10, 20, { message: 'Số điện thoại không hợp lệ' })
  phone: string = '';
}

export class VerifyOtpRequest {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string = '';

  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  otp: string = '';
}

export interface UserProfileUpdateRequest {
  fullName: string;
  phone: string;
}

export class ChangePasswordRequest {
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' }) 
  oldPassword: string = '';

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @Length(8, 100, { message: 'Mật khẩu phải từ 8 đến 100 ký tự' })
  newPassword: string = '';
}

export interface UserRoleUpdateRequest {
  role: UserRole;
}
