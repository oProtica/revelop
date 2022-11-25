import { FeedPost } from 'src/posts/models/post.interface';
import { Role } from './role.enum';

export interface User {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password: string;
  role?: Role;
  darkMode?: boolean;
  twofa?: any;
  emailVerified?: boolean;
  discordId?: number;
  robloxId?: number;
  posts?: FeedPost[];
}
