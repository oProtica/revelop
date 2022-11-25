import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Please enter an email' })
  @IsEmail({ message: 'Invalid email' })
  email: string;

  @IsNotEmpty({ message: 'Please enter a username' })
  @Length(6, 20, {
    message:
      'Enter a username between $constraint1 and $constraint2 characters',
  })
  username: string;

  @IsNotEmpty({ message: 'Please enter a first name' })
  firstName: string;

  @IsNotEmpty({ message: 'Please enter a last name' })
  lastName: string;

  @IsNotEmpty({ message: 'Please enter a password' })
  @Length(8, 32, {
    message:
      'Enter a password between $constraint1 and $constraint2 characters',
  })
  password: string;
}
