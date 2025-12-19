export interface IToken {
  id: number;
  isActive: boolean;
  role: string;
  iat?: any;
  exp?: any;
}
