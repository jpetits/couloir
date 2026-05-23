import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { users } from "../db/schema";
import { UserRepository } from "./user.repository";

type User = typeof users.$inferSelect;

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  getMe(user: User) {
    return {
      stravaConnected: !!user.stravaAccessToken,
      username: user.username ?? null,
      isPublic: user.isPublic ?? false,
    };
  }

  async getByUsername(username: string) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new NotFoundException("User not found");
    return { username: user.username, isPublic: user.isPublic };
  }

  async patch(userId: string, username: string, isPublic: boolean) {
    const existing = await this.userRepository.findByUsername(username);
    if (existing && existing.id !== userId) {
      console.log("inside existing && existing.id !== userId", {
        existing,
        userId,
      });
      throw new BadRequestException("Username already taken");
    }

    const result = await this.userRepository.update(userId, {
      username,
      isPublic,
    });

    if (!result) throw new NotFoundException("User not found");
    console.log("User updated", { result });

    return { message: "User updated successfully" };
  }
}
