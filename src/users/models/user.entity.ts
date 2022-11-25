import { Exclude, Expose } from 'class-transformer';
import { FeedPostEntity } from 'src/posts/models/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.enum';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  public id: string;

  @Column({ unique: true })
  @Expose()
  public email: string;

  @Column({ unique: true })
  @Expose()
  public username: string;

  @Column()
  @Expose()
  public firstName: string;

  @Column()
  @Expose()
  public lastName: string;

  @Column()
  @Exclude()
  public password: string;

  @Column({
    nullable: true,
  })
  @Exclude()
  public refreshToken?: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  @Expose()
  public role: Role;

  @Column({ default: 'false' })
  @Expose()
  public darkMode: boolean;

  @Column({ nullable: true })
  @Exclude()
  public twoFaSecret: string;

  @Column({ default: false })
  @Exclude()
  public twoFaEnabled: boolean;

  @Column({ default: 'false' })
  @Expose()
  public emailVerified: boolean;

  @Column({ nullable: true })
  @Expose()
  public discordId: number;

  @Column({ nullable: true })
  @Expose()
  public robloxId: number;

  @OneToMany(() => FeedPostEntity, (feedPostEntity) => feedPostEntity.author)
  @Expose()
  public feedPosts: FeedPostEntity[];

  @CreateDateColumn()
  @Expose()
  public createdAt: Date;
}
