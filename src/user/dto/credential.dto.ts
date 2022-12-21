import { IsString } from 'class-validator';

export class CredentialDto {
  @IsString()
  key: string;
}
