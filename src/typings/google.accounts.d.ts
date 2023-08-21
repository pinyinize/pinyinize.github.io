/// <reference types='google.accounts' />

declare namespace google.accounts.oauth2 {
  interface TokenClient {
    callback?: (tokenResponse: TokenResponse) => void;
  }
}
