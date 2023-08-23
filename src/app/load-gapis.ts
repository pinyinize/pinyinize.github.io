/// <reference types='gapi' />
/// <reference types='google.accounts' />
/// <reference types='@maxim_mazurok/gapi.client.people' />

import {BehaviorSubject, forkJoin, from, of} from 'rxjs';
import {filter, map, shareReplay, switchMap} from 'rxjs/operators';

import {environment} from '../environments/environment';

type TokenClient = google.accounts.oauth2.TokenClient;


export enum LoginStatus {
  Initializing,
  LoggedOut,
  LoggingIn,
  LoggedIn,
}

export const loginStatusSubj =
    new BehaviorSubject<LoginStatus>(LoginStatus.Initializing);


// Gapi short for Google API Client Library for JavaScript.
export const gapiLoadedSubj = new BehaviorSubject<boolean>(false);

// GIS short for Google Identity Services.
export const gisLoadedSubj = new BehaviorSubject<boolean>(false);


const DISCOVERY_DOC =
    'https://www.googleapis.com/discovery/v1/apis/people/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/contacts';

const gapiInitedObs = gapiLoadedSubj.pipe(
    // Wait for a `true` value
    filter(b => b),
    // Load GAPI Client
    switchMap(() => from(new Promise<void>((resolve, reject) => {
                gapi.load('client', {
                  timeout: 10000,
                  callback: resolve,
                  onerror: reject,
                  ontimeout: reject,
                });
              }))),
    // Initialize GAPI Client
    switchMap(() => from(gapi.client.init({
                apiKey: environment.API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
              }))),
);

const gisInitedObs = gisLoadedSubj.pipe(
    // Wait for a `true` value
    filter(b => b),
    // Create token client
    map(() => google.accounts.oauth2.initTokenClient({
      client_id: environment.CLIENT_ID,
      scope: SCOPES,
      callback: () => {},
      error_callback: myErrorCallback,
    })),
);

function myErrorCallback(err: google.accounts.oauth2.ClientConfigError) {
  if (err.type == 'popup_failed_to_open') {
    // The popup window is failed to open
  } else if (err.type == 'popup_closed') {
    // The popup window is closed before an OAuth response is returned
  }
}


export const tokenClientObs =
    forkJoin([gapiInitedObs, gisInitedObs])
        .pipe(
            map(([unusedVoid, tokenClient]) => tokenClient),
            // Try to login if there's a token already.
            switchMap((tokenClient) => {
              if (gapi.client.getToken()) {
                return new Promise<TokenClient>((resolve, reject) => {
                  tryToLoginSilently(tokenClient, resolve, reject);
                });
              } else {
                loginStatusSubj.next(LoginStatus.LoggedOut);
                return of(tokenClient);
              }
            }),
            shareReplay(1),
        );

function tryToLoginSilently(
    tokenClient: TokenClient,
    resolve: (tokenClient: TokenClient) => void,
    reject: (err: unknown) => void,
) {
  loginStatusSubj.next(LoginStatus.LoggingIn);
  tokenClient.callback = (resp) => {
    tokenClient.callback = () => {};
    if (resp.error) {
      loginStatusSubj.next(LoginStatus.LoggedOut);
      reject(`${resp.error} ${resp.error_description} on ${resp.error_uri}`);
    } else {
      loginStatusSubj.next(LoginStatus.LoggedIn);
      resolve(tokenClient);
    }
  };
  tokenClient.requestAccessToken({prompt: ''});
}

tokenClientObs.subscribe();
