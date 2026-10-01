import { Component } from '@angular/core';
import { FooterComponent } from '@coreui/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-default-footer',
  templateUrl: './default-footer.component.html',
  styleUrls: ['./default-footer.component.scss'],
  imports: [FooterComponent, RouterLink]
})
export class DefaultFooterComponent {
  currentYear = new Date().getFullYear();
}
