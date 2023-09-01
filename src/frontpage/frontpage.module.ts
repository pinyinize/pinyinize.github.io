import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {FrontpageComponent} from './frontpage.component';


@NgModule({
  declarations: [
    FrontpageComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    FrontpageComponent,
  ],
})
export class FrontpageModule {
}
