import { IsOptional } from 'class-validator';

export class ExtrafieldsDto {
  @IsOptional()
  redirect: boolean;

  @IsOptional()
  csrfToken: string;

  @IsOptional()
  callbackUrl: string;

  @IsOptional()
  json: any;
}
