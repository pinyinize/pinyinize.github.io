import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatTableModule} from '@angular/material/table';

import {EditorComponent} from './editor.component';


@NgModule({
  declarations: [
    EditorComponent,
  ],
  imports: [
    CommonModule,
    MatTableModule,
  ]
})
export class EditorModule {
}
