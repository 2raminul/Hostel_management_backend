import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectConnection, Knex } from 'nestjs-knex';
import {
  APP_MODULES,
  AppModuleKey,
  ModuleAccess,
} from './permissions.constants';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    @InjectConnection()
    private readonly hmDb: Knex,
  ) {}

  fullAccess(): Record<string, ModuleAccess> {
    return Object.fromEntries(
      APP_MODULES.map((m) => [
        m,
        { view: true, edit: true, delete: true },
      ]),
    ) as Record<string, ModuleAccess>;
  }

  private deniedAll(): Record<string, ModuleAccess> {
    return Object.fromEntries(
      APP_MODULES.map((m) => [
        m,
        { view: false, edit: false, delete: false },
      ]),
    ) as Record<string, ModuleAccess>;
  }

  /** MySQL missing table/column for permissions schema */
  private isPermissionsSchemaError(e: unknown): boolean {
    const err = e as { errno?: number; code?: string; message?: string };
    if (err?.errno === 1146 || err?.code === 'ER_NO_SUCH_TABLE') return true;
    if (err?.errno === 1054 || err?.code === 'ER_BAD_FIELD_ERROR') return true;
    const msg = err?.message;
    return (
      typeof msg === 'string' &&
      (msg.includes("doesn't exist") || msg.includes('Unknown column'))
    );
  }

  /**
   * If `users.is_admin` is missing (migration not applied), treat user id 1 as admin
   * so the seeded admin can still sign in; otherwise load from DB.
   */
  async isUserAdmin(userId: number): Promise<boolean> {
    try {
      const row = await this.hmDb('users')
        .select('is_admin')
        .where('id', userId)
        .whereNull('deleted_at')
        .first();
      return !!(row as { is_admin?: number })?.is_admin;
    } catch (e) {
      this.logger.warn(
        `isUserAdmin query failed — apply db/migration_permissions.sql. userId=${userId}`,
      );
      this.logger.debug(e);
      return userId === 1;
    }
  }

  /** Effective map for JWT / UI (admins get full access). */
  async getEffectivePermissions(
    userId: number,
  ): Promise<Record<string, ModuleAccess>> {
    try {
      if (await this.isUserAdmin(userId)) {
        return this.fullAccess();
      }
      const rows = await this.hmDb('user_permissions')
        .where({ user_id: userId })
        .select('module_key', 'can_view', 'can_edit', 'can_delete');

      const map: Record<string, ModuleAccess> = {};
      for (const m of APP_MODULES) {
        map[m] = { view: false, edit: false, delete: false };
      }
      for (const r of rows as any[]) {
        const key = r.module_key as string;
        if (!APP_MODULES.includes(key as AppModuleKey)) continue;
        map[key] = {
          view: !!r.can_view,
          edit: !!r.can_edit,
          delete: !!r.can_delete,
        };
      }
      return map;
    } catch (e) {
      this.logger.warn(
        `getEffectivePermissions failed — apply db/migration_permissions.sql. userId=${userId}`,
      );
      this.logger.debug(e);
      return this.deniedAll();
    }
  }

  async listUserPermissions(userId: number) {
    await this.ensureUserExists(userId);
    try {
      return await this.hmDb('user_permissions').where({ user_id: userId });
    } catch (e) {
      if (this.isPermissionsSchemaError(e)) {
        this.logger.warn(
          `listUserPermissions: schema missing — run db/migration_permissions.sql (or full migration.sql). userId=${userId}`,
        );
        return [];
      }
      throw e;
    }
  }

  async replaceUserPermissions(
    userId: number,
    modules: Record<string, Partial<ModuleAccess>>,
  ) {
    if (await this.isUserAdmin(userId)) {
      throw new BadRequestException('Cannot change permissions for an admin user.');
    }
    await this.ensureUserExists(userId);
    const trx = await this.hmDb.transaction();
    try {
      await trx('user_permissions').where({ user_id: userId }).del();
      const inserts: Record<string, unknown>[] = [];
      for (const [key, access] of Object.entries(modules)) {
        if (!APP_MODULES.includes(key as AppModuleKey)) continue;
        inserts.push({
          user_id: userId,
          module_key: key,
          can_view: access.view ? 1 : 0,
          can_edit: access.edit ? 1 : 0,
          can_delete: access.delete ? 1 : 0,
        });
      }
      if (inserts.length) await trx('user_permissions').insert(inserts);
      await trx.commit();
    } catch (e) {
      await trx.rollback();
      if (this.isPermissionsSchemaError(e)) {
        throw new ServiceUnavailableException(
          'Permissions tables or columns are missing. Run db/migration_permissions.sql on your database (adds users.is_admin and user_permissions), then restart the API.',
        );
      }
      throw e;
    }
    return this.getEffectivePermissions(userId);
  }

  private async ensureUserExists(userId: number) {
    const u = await this.hmDb('users')
      .where('id', userId)
      .whereNull('deleted_at')
      .first();
    if (!u) throw new BadRequestException('User not found.');
  }
}
