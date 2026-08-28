import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Return null if there is an error or no user, allowing the request to proceed as a guest.
    if (err || !user) {
      return null;
    }
    return user;
  }
}
