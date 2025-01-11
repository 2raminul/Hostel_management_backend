export type RequestUser = {
  userId: number;
  iat: number;
  exp: number;
  refreshToken: string;
};

export type OtpUser = {
  userId: number;
  iat: number;
  exp: number;
  token: string;
};
