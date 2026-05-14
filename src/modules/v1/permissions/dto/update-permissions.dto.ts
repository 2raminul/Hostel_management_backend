import { IsObject } from 'class-validator';

export class UpdatePermissionsDto {
  @IsObject()
  modules: Record<
    string,
    { view?: boolean; edit?: boolean; delete?: boolean }
  >;
}
