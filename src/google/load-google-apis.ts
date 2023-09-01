/// <reference types='gapi' />
/// <reference types='google.accounts' />
/// <reference types='@maxim_mazurok/gapi.client.people' />

import {BehaviorSubject, filter, from, map, Observable, shareReplay, switchMap, take} from 'rxjs';

import {environment} from '../environments/environment';


type TokenClient = google.accounts.oauth2.TokenClient;
const DISCOVERY_DOC =
    'https://www.googleapis.com/discovery/v1/apis/people/v1/rest';
const SCOPES = 'https://www.googleapis.com/auth/contacts';


// Gapi: short for Google API Client Library for JavaScript.
const gapiLoadedSubj = new BehaviorSubject<boolean>(false);
// GIS: short for Google Identity Services.
const gisLoadedSubj = new BehaviorSubject<boolean>(false);
// Initial setups of these subjects and related callback functions.
if (window.gapi) {
  gapiLoadedSubj.next(true);
}
if (window.google?.accounts?.oauth2) {
  gisLoadedSubj.next(true);
}
(window as any)['gapiLoaded'] = () => {
  gapiLoadedSubj.next(true);
};
(window as any)['gisLoaded'] = () => {
  gisLoadedSubj.next(true);
};


export const gapiInitedObs: Observable<typeof gapi> = gapiLoadedSubj.pipe(
    // Wait for a `true` value
    filter(b => b),
    take(1),
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
    // Return the `gapi` namespace, so that clients don't have to import types.
    map(() => gapi),
    // Only do the above once.
    shareReplay(1),
);

gapiInitedObs.subscribe();


export const tokenClientObs: Observable<TokenClient> = gisLoadedSubj.pipe(
    // Wait for a `true` value
    filter(b => b),
    take(1),
    // Create token client
    map(() => google.accounts.oauth2.initTokenClient({
      client_id: environment.CLIENT_ID,
      scope: SCOPES,
      callback: dummyTokenClientCallback,
      error_callback: dummyTokenClientErrorCallback,
    })),
    // Only do the above once.
    shareReplay(1),
);

function dummyTokenClientCallback(resp: unknown) {
  console.warn(
      'There is a potential issue in the code. This dummy TokenClient ' +
          'callback that should not be called is called. Response: ',
      resp);
}

function dummyTokenClientErrorCallback(err: unknown) {
  console.warn(
      'There is a potential issue in the code. This dummy TokenClient ' +
          'error callback that should not be called is called. Error: ',
      err);
}

tokenClientObs.subscribe();
