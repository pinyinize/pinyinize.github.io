/// <reference types='@maxim_mazurok/gapi.client.people' />

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnDestroy} from '@angular/core';
import {combineLatest, filter, Subscription, take} from 'rxjs';

import {signinStateSubj} from '../google/google-signin';
import {gapiInitedObs} from '../google/load-google-apis';

type GapiPerson = gapi.client.people.Person;


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements OnDestroy {
  loadContactsSubscr: Subscription;
  personArray: Person[] = [];

  constructor(
      private readonly changeDetectorRef: ChangeDetectorRef,
      private readonly ngZone: NgZone,
  ) {
    const signInObs = signinStateSubj.pipe(filter(b => b.isSignedIn));
    this.loadContactsSubscr = combineLatest([gapiInitedObs, signInObs])
                                  .pipe(take(1))
                                  .subscribe(() => this.loadContacts());
  }

  ngOnDestroy() {
    this.loadContactsSubscr.unsubscribe();
  }

  async loadContacts() {
    let nextPageToken = '';
    const persons: GapiPerson[] = [];

    do {
      const resp = await gapi.client.people.people.connections.list({
        resourceName: 'people/me',
        personFields: 'names,nicknames,organizations,userDefined',
        pageSize: 1000,
        pageToken: nextPageToken,
      });
      if (resp.status && resp.status >= 400 && resp.status < 500) {
        // handle not-authorized
        return;
      }

      persons.concat(persons, resp.result.connections || []);
      nextPageToken = resp.result.nextPageToken || '';
    } while (nextPageToken);

    this.personArray = persons.map(p => new Person(p));
    this.ngZone.run(() => this.changeDetectorRef.markForCheck());
  }
}


class Person {
  displayName = '';
  familyName?: string;
  familyNamePhonetic?: string;
  familyNamePhoneticChanged?: string;
  givenName?: string;
  givenNamePhonetic?: string;
  givenNamePhoneticChanged?: string;
  prefix?: string;
  suffix?: string;

  constructor(readonly gapiPerson: GapiPerson) {
    const name = gapiPerson.names?.[0];
    if (name) {
      this.displayName = name.displayName || '';
      this.familyName = name.familyName;
      this.familyNamePhonetic = name.phoneticGivenName;
      this.familyNamePhoneticChanged = name.phoneticGivenName;
      this.givenName = name.givenName;
      this.givenNamePhonetic = name.phoneticGivenName;
      this.givenNamePhoneticChanged = name.phoneticGivenName;
      this.prefix = name.honorificPrefix;
      this.suffix = name.honorificSuffix;
    }
  }

  get resourceName(): string {
    return this.gapiPerson.resourceName || '';
  }
}
