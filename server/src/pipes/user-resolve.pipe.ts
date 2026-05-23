import {
  Injectable,
  NotFoundException,
  type PipeTransform,
} from "@nestjs/common";
import { UserRepository } from "../user/user.repository";

@Injectable()
export class UserPublicResolvePipe implements PipeTransform {
  constructor(private userRepository: UserRepository) {}

  async transform(username: string) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new NotFoundException("User not found");
    if (!user.isPublic) throw new NotFoundException("User not found");
    return user;
  }
}
