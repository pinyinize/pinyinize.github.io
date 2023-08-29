import {BehaviorSubject, forkJoin, from, Observable, tap} from 'rxjs';

import {gapiInitedObs, tokenClientObs} from './load-google-apis';


type TokenClient = google.accounts.oauth2.TokenClient;
type TokenResponse = google.accounts.oauth2.TokenResponse;
type ClientConfigError = google.accounts.oauth2.ClientConfigError;

export enum SignInStatus {
  SignedOut,
  SignedIn,
}

export const signinStatusSubj =
    new BehaviorSubject<[SignInStatus, string]>([SignInStatus.SignedOut, '']);


export function signIn(): Observable<TokenClient> {
  return tokenClientObs.pipe(tap(tokenClient => {
    const prompt = isLastSignOutExplicit() ? 'consent' : '';
    tokenClient.callback = tokenCallback;
    tokenClient.error_callback = tokenErrorCallback;
    tokenClient.requestAccessToken({prompt});
  }));
}

export function signInWhenSignedOut(): Observable<TokenClient> {
  if (signinStatusSubj.value) return tokenClientObs;
  return signIn();
}

export function signOut(): Observable<typeof gapi> {
  return gapiInitedObs.pipe(tap(gapi => {
    gapi.client.setToken(null);
    setSignOutExplicit(true);
    signinStatusSubj.next([SignInStatus.SignedOut, '']);
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
    updateSigninStatusErrorMessage('TODO');
  } else {
    signinStatusSubj.next([SignInStatus.SignedIn, '']);
  }
}

function tokenErrorCallback(err: ClientConfigError) {
  switch (err.type) {
    case 'popup_failed_to_open':
      updateSigninStatusErrorMessage('TODO');
      break;
    case 'popup_closed':
      updateSigninStatusErrorMessage('TODO');
      break;
    default:
      updateSigninStatusErrorMessage(err.type);
  }
}

function updateSigninStatusErrorMessage(msg: string) {
  if (signinStatusSubj.value[0] !== SignInStatus.SignedOut) {
    console.warn(
        '`updateSigninStatusErrorMessage` should be only called at signed ' +
            'out. But the current signin status is ',
        signinStatusSubj.value[0]);
  }
  signinStatusSubj.next([signinStatusSubj.value[0], msg]);
}
