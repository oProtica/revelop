import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { from, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User } from '../models/user.interface';

import { MessagingService, OpenCloud } from 'rbxcloud';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  hashPassword(password: string): Observable<string> {
    return from(bcrypt.hash(password, 12));
  }

  // Signup
  signup(user: User): Observable<User> {
    const { firstName, lastName, email, password } = user;

    return this.hashPassword(password).pipe(
      switchMap((hashedPassword: string) => {
        return from(
          this.userRepository.save({
            firstName,
            lastName,
            email,
            password: hashedPassword,
          }),
        ).pipe(
          map((user: User) => {
            delete user.password;
            return user;
          }),
        );
      }),
    );
  }

  validateUser(email: string, password: string): Observable<User> {
    return from(
      this.userRepository.findOne({
        where: { email },
        select: ['id', 'firstName', 'lastName', 'email', 'password', 'role'],
      }),
    ).pipe(
      switchMap((user: User) =>
        from(bcrypt.compare(password, user.password)).pipe(
          map((isValidPassword: boolean) => {
            if (isValidPassword) {
              delete user.password;
              return user;
            }
          }),
        ),
      ),
    );
  }

  signin(user: User): Observable<string> {
    const { email, password } = user;
    return this.validateUser(email, password).pipe(
      switchMap((user: User) => {
        if (user) {
          // Create jwt - credentials
          return from(this.jwtService.signAsync({ user }));
        }
      }),
    );
  }

  announce(topic: string, message: string): Observable<any> {
    OpenCloud.Configure({
      DataStoreService: process.env.Cloud_DataStoreService, // Unless set DataStoreService.RegisterAPIKey('API-KEY'), all DataStoreService calls will use this key by default
      MessagingService: process.env.Cloud_MessagingService, // Unless set MessagingService.RegisterAPIKey('API-KEY'), all MessagingService calls will use this key by default
      UniverseID: 3731136958, //UniverseId
    });

    return from(
      MessagingService.PublishAsync(topic, message).catch((err) => {
        console.error(err);
      }),
    );
  }
}
