import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EditorComponent} from 'src/editor/editor.component';
import {EditorModule} from 'src/editor/editor.module';
import {FrontpageComponent} from 'src/frontpage/frontpage.component';
import {FrontpageModule} from 'src/frontpage/frontpage.module';


const routes: Routes = [
  {path: '', pathMatch: 'full', component: FrontpageComponent},
  {path: 'editor', component: EditorComponent},
  {path: '**', redirectTo: '/'},
];


@NgModule({
  imports: [
    EditorModule,
    FrontpageModule,
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
