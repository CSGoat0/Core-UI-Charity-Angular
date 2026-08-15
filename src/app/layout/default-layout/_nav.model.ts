import { INavData } from '@coreui/angular';

export interface INavDataExtended extends INavData {
  roles?: string[];
  children?: INavDataExtended[];
}
