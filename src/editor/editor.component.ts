/// <reference types='@maxim_mazurok/gapi.client.people' />

import {ChangeDetectionStrategy, Component} from '@angular/core';

type GapiPerson = gapi.client.people.Person;


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent {
  personArray: Person[] = [];
}


class Person {
  displayName = '';
  familyName?: string;
  familyNamePhonetic?: string;
  givenName?: string;
  givenNamePhonetic?: string;
  prefix?: string;
  suffix?: string;

  constructor(readonly gapiPerson: GapiPerson) {
    const name = gapiPerson.names?.[0];
    if (name) {
      this.displayName = name.displayName || '';
      this.familyName = name.familyName;
      this.familyNamePhonetic = name.phoneticGivenName;
      this.givenName = name.givenName;
      this.givenNamePhonetic = name.phoneticGivenName;
      this.prefix = name.honorificPrefix;
      this.suffix = name.honorificSuffix;
    }
  }

  get resourceName(): string {
    return this.gapiPerson.resourceName || '';
  }
}
