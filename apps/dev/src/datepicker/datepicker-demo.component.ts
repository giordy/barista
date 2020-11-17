/**
 * @license
 * Copyright 2020 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from '@angular/core';
import { DtDateAdapter } from '@dynatrace/barista-components/core';

@Component({
  selector: 'demo-component',
  templateUrl: 'datepicker-demo.component.html',
  styleUrls: ['datepicker-demo.component.scss'],
})
export class DatepickerDemo {
  startAt = new Date(2020, 7, 31);
  minDate = new Date(2020, 5, 31);
  maxDate = new Date(2020, 11, 31);
  isDatepickerDisabled = false;
  isTimepickerDisabled = false;
  isDarkDatepickerDisabled = false;
  isDarkTimepickerDisabled = false;
  isDatepickerTimeEnabled = true;
  isDarkDatepickerTimeEnabled = true;

  constructor(public _dateAdapter: DtDateAdapter<any>) {}
}
