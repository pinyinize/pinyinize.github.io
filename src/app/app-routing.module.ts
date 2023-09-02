import {NgModule} from '@angular/core';
import {Router, RouterModule, Routes} from '@angular/router';
import {distinctUntilChanged, map, skip} from 'rxjs';
import {signinStateSubj} from 'src/google/google-signin';

import {EditorComponent} from '../editor/editor.component';
import {EditorModule} from '../editor/editor.module';
import {FrontpageComponent} from '../frontpage/frontpage.component';
import {FrontpageModule} from '../frontpage/frontpage.module';


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
  constructor(private readonly router: Router) {
    this.navigateToEditorAtSignInAndNavigateBackAtSignOut();
  }

  navigateToEditorAtSignInAndNavigateBackAtSignOut() {
    signinStateSubj
        .pipe(
            map(state => state.isSignedIn),
            distinctUntilChanged(),
            skip(1),
            )
        .subscribe(isSignedIn => {
          if (isSignedIn) {
            this.router.navigateByUrl('/editor');
          } else {
            this.router.navigateByUrl('/');
          }
        });
  }
}
