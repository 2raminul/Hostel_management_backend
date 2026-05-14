export type ModuleAccess = {
  view: boolean;
  edit: boolean;
  delete: boolean;
};

export type RequestUser = {
  userId: number;
  iat?: number;
  exp?: number;
  refreshToken?: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  permissions?: Record<string, ModuleAccess>;
};

export type OtpUser = {
  userId: number;
  iat: number;
  exp: number;
  token: string;
};
