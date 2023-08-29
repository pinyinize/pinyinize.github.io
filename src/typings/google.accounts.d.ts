/// <reference types='google.accounts' />

declare namespace google.accounts.oauth2 {
  interface TokenClient {
    callback?: (resp: TokenResponse) => void;
    error_callback?: (error: google.accounts.oauth2.ClientConfigError) => void;
  }
}
