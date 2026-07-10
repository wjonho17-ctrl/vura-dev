export enum TokenType {
  RESET_PASSWORD = 'RESET_PASSWORD',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  CREATE_ADMINISTRATOR = 'CREATE_ADMINISTRATOR',
  CREATE_MANAGER = 'CREATE_MANAGER'
}

export type TokenVerifcationType = Exclude<TokenType, TokenType.RESET_PASSWORD>
export type TokenCreationAccount = Exclude<TokenVerifcationType, TokenType.VERIFY_EMAIL>