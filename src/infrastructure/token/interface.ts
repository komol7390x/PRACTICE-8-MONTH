export interface IToken {
  id: number;
  isActive: boolean;
  role: string;
  iat?: string;
  exp?: string;
}
