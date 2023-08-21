import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {gapiLoadedSubj, gisLoadedSubj} from './app/load-gapis';


declare global {
  interface Window {
    gapiLoaded?: () => void;
    gisLoaded?: () => void;
  }
}

window.gapiLoaded = () => {
  gapiLoadedSubj.next(true);
  gapiLoadedSubj.complete();
};

window['gisLoaded'] = () => {
  gisLoadedSubj.next(true);
  gisLoadedSubj.complete();
};


platformBrowserDynamic().bootstrapModule(AppModule).catch(
    err => console.error(err));
