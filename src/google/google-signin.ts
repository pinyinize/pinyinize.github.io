import {BehaviorSubject, Observable, tap} from 'rxjs';

import {gapiInitedObs, tokenClientObs} from './load-google-apis';


type TokenClient = google.accounts.oauth2.TokenClient;
type TokenResponse = google.accounts.oauth2.TokenResponse;
type ClientConfigError = google.accounts.oauth2.ClientConfigError;


export class SignInState {
  constructor(
      readonly isSignedIn: boolean,
      readonly unknownErrorType?: 'popup_failed_to_open'|'popup_closed',
      readonly arbitraryErrorMessage?: string,
  ) {}
}

export const signinStateSubj =
    new BehaviorSubject<SignInState>(new SignInState(false));


export function signIn(): Observable<TokenClient> {
  return tokenClientObs.pipe(tap(tokenClient => {
    // I originally wants user who is trying to sign in after previously signed
    // out to see a full consent page. But later I think it's not necessary.
    // const prompt = isLastSignOutExplicit() ? 'consent' : '';
    const prompt = '';
    tokenClient.callback = tokenCallback;
    tokenClient.error_callback = tokenErrorCallback;
    tokenClient.requestAccessToken({prompt});
  }));
}

export function signInWhenSignedOut(): Observable<TokenClient> {
  if (signinStateSubj.value) return tokenClientObs;
  return signIn();
}

export function signOut(): Observable<typeof gapi> {
  return gapiInitedObs.pipe(tap(gapi => {
    gapi.client.setToken(null);
    setSignOutExplicit(true);
    signinStateSubj.next(new SignInState(false));
  }));
}

function isLastSignOutExplicit(): boolean {
  try {
    return JSON.parse(localStorage.getItem('signOutExplicit') || 'false');
  } catch {
    return false;
  }
}

function setSignOutExplicit(isExplicit: boolean) {
  localStorage.setItem('signOutExplicit', JSON.stringify(isExplicit));
}

function tokenCallback(resp: TokenResponse) {
  if (resp.error) {
    signinStateSubj.next(new SignInState(
        false, undefined, `${resp.error}: ${resp.error_description}`));
  } else {
    signinStateSubj.next(new SignInState(true));
  }
}

function tokenErrorCallback(err: ClientConfigError) {
  switch (err.type) {
    case 'popup_failed_to_open':
    case 'popup_closed':
      signinStateSubj.next(new SignInState(false, err.type));
      break;
    default:
      signinStateSubj.next(new SignInState(false, undefined, err.type));
  }
}
