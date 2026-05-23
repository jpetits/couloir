import { getAuth } from "@clerk/express";
import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UserRepository } from "../user/user.repository";

@Injectable()
export class ClerkGuard implements CanActivate {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { userId } = getAuth(req);

    if (!userId) throw new UnauthorizedException();

    req.user = await this.userRepository.findOrCreate(userId);
    return true;
  }
}
