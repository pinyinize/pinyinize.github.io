/// <reference types='@maxim_mazurok/gapi.client.people' />

import {ChangeDetectionStrategy, Component} from '@angular/core';

import {signIn, signOut, signinStateSubj} from '../google/google-signin';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'myApp';
  readonly signinStateSubj = signinStateSubj;

  signInNow() {
    signIn().subscribe();
  }

  signOutNow() {
    signOut().subscribe();
  }
}

// Not used yet.
async function listConnectionNames() {
  let response:
      gapi.client.Response<gapi.client.people.ListConnectionsResponse>;
  try {
    // Fetch first 10 files
    response = await gapi.client.people.people.connections.list({
      'resourceName': 'people/me',
      'pageSize': 10,
      'personFields': 'names,emailAddresses',
    });
  } catch (err) {
    console.log(err);
    return;
  }
  const connections = response.result.connections;
  if (!connections || connections.length == 0) {
    document.getElementById('content')!.innerText = 'No connections found.';
    return;
  }
  // Flatten to string to display
  const output = connections.reduce((str, person) => {
    if (!person.names || person.names.length === 0) {
      return `${str}Missing display name\n`;
    }
    return `${str}${person.names[0].displayName}\n`;
  }, 'Connections:\n');
  document.getElementById('content')!.innerText = output;
}
