import { AuthGuard } from '@nestjs/passport';

export class ApiKeyAuthGuard extends AuthGuard('api-key') {}
