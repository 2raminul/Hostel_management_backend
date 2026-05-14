/** Keys used in JWT and user_permissions.module_key */
export const APP_MODULES = [
  'dashboard',
  'category',
  'income',
  'expenses',
  'inventory',
  'rooms',
  'settings',
  'users',
  'reports',
] as const;

export type AppModuleKey = (typeof APP_MODULES)[number];

export type ModuleAccess = {
  view: boolean;
  edit: boolean;
  delete: boolean;
};
