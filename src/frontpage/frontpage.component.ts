import {ChangeDetectionStrategy, Component} from '@angular/core';


@Component({
  selector: 'frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrontpageComponent {
}
