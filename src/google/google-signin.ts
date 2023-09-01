import {BehaviorSubject, Observable, tap} from 'rxjs';

import {gapiInitedObs, tokenClientObs} from './load-google-apis';


type TokenClient = google.accounts.oauth2.TokenClient;
type TokenResponse = google.accounts.oauth2.TokenResponse;
type ClientConfigError = google.accounts.oauth2.ClientConfigError;


export class SignInState {
  constructor(
      readonly status: 'out'|'in',
      readonly unknownErrorType?: 'popup_failed_to_open'|'popup_closed',
      readonly arbitraryErrorMessage?: string,
  ) {}
}

export const signinStateSubj =
    new BehaviorSubject<SignInState>(new SignInState('out'));


export function signIn(): Observable<TokenClient> {
  return tokenClientObs.pipe(tap(tokenClient => {
    const prompt = isLastSignOutExplicit() ? 'consent' : '';
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
    signinStateSubj.next(new SignInState('out'));
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
        'out', undefined,
        `${resp.error}: ${resp.error_description}`));
  } else {
    signinStateSubj.next(new SignInState('in'));
  }
}

function tokenErrorCallback(err: ClientConfigError) {
  switch (err.type) {
    case 'popup_failed_to_open':
    case 'popup_closed':
      signinStateSubj.next(new SignInState('out', err.type));
      break;
    default:
      signinStateSubj.next(
          new SignInState('out', undefined, err.type));
  }
}
