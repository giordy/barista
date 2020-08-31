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

import { TemplatePortal } from '@angular/cdk/portal';
// tslint:disable: template-cyclomatic-complexity
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { DtCheckboxChange } from '@dynatrace/barista-components/checkbox';
import { xor } from 'lodash-es';
import { DtGroupDef, DtNodeDef, DtOptionDef, isDtGroupDef } from '../types';

let _uniqueIdCounter = 0;

export class DtFilterFieldMultiSelectSubmittedEvent {
  constructor(
    /** Reference to the filter field multiSelect panel that emitted the event. */
    public source: DtFilterFieldMultiSelect,
    /** Selected option(s) */
    public multiSelect: DtNodeDef<DtOptionDef>[],
  ) {}
}

/** Valid FilterfieldMultiSelect operators. */
export type DtFilterFieldMultiSelectOperator =
  | 'multiSelect'
  | 'lower-equal'
  | 'greater-equal'
  | 'equal';

@Component({
  selector: 'dt-filter-field-multi-select',
  templateUrl: 'filter-field-multi-select.html',
  styleUrls: ['filter-field-multi-select.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  exportAs: 'dtFilterFieldMultiSelect',
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DtFilterFieldMultiSelect implements AfterViewInit {
  /**
   * Specify the width of the autocomplete panel.  Can be any CSS sizing value, otherwise it will
   * match the width of its host.
   */
  @Input() panelWidth: string | number;

  /** Options or groups to be displayed */
  @Input()
  get optionsOrGroups(): Array<
    DtNodeDef<DtGroupDef | DtOptionDef> & { option: DtOptionDef }
  > {
    return this._optionsOrGroups ?? [];
  }
  set optionsOrGroups(
    opts: Array<DtNodeDef<DtGroupDef | DtOptionDef> & { option: DtOptionDef }>,
  ) {
    this._optionsOrGroups = !!opts ? opts : [];
    this._filterOptions();
  }
  _optionsOrGroups: Array<
    DtNodeDef<DtGroupDef | DtOptionDef> & { option: DtOptionDef }
  > = [];
  _filteredOptionsOrGroups: Array<
    DtNodeDef<DtGroupDef | DtOptionDef> & { option: DtOptionDef }
  > = [];

  /** Value input by the user used to highlight and filter */
  @Input()
  get inputValue(): string {
    return this._inputValue || '';
  }
  set inputValue(value: string) {
    this._inputValue = value.toLowerCase();
    this._checkApplyDisable();
    this._filterOptions();
  }
  _inputValue: string;

  /** Event that is emitted when the filter-field multiSelect panel is opened. */
  @Output() readonly opened = new EventEmitter<void>();

  /** Event that is emitted when the filter-field multiSelect panel is closed. */
  @Output() readonly closed = new EventEmitter<void>();

  /** Event that is emitted whenever an option from the list is selected. */
  @Output() readonly multiSelectSubmitted = new EventEmitter<
    DtFilterFieldMultiSelectSubmittedEvent
  >();

  /** Unique ID to be used by filter-field multiSelect trigger's "aria-owns" property. */
  id = `dt-filter-field-multiSelect-${_uniqueIdCounter++}`;

  /** Whether the filter-field multiSelect panel is open. */
  get isOpen(): boolean {
    return this._isOpen;
  }
  /** @internal Whether the filter-field multiSelect panel is open. */
  _isOpen = false;

  /** @internal */
  @ViewChild(TemplateRef, { static: true }) _template: TemplateRef<{}>;

  /** @internal */
  _portal: TemplatePortal;

  /** @internal Holds the current values of the input field for the from value */
  _currentSelection: DtNodeDef<DtOptionDef>[] = [];

  /** @internal Holds the current values of the input field for the from value */
  _initialSelection: DtNodeDef<DtOptionDef>[] = [];

  /** @internal Holds the current values of the input field for the from value */
  _applyDisabled: boolean;

  constructor(
    private _viewContainerRef: ViewContainerRef,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this._portal = new TemplatePortal<{}>(
      this._template,
      this._viewContainerRef,
    );
  }

  /** Sets focus to the operator button group. */
  focus(): void {
    // this._operatorGroup.focus();
  }

  /** @internal Marks the filter-field multiSelect for change detection. */
  _markForCheck(): void {
    this._changeDetectorRef.markForCheck();
  }

  /** @internal Unique ID to be used on a local element */
  _getLocalId(suffix: string): string {
    return `${this.id}-${suffix}`;
  }

  /** @internal Handles the submit of multiSelect values. */
  _handleSubmit(event: Event): void {
    event.preventDefault();
    event.stopImmediatePropagation();

    this.multiSelectSubmitted.emit(
      new DtFilterFieldMultiSelectSubmittedEvent(this, this._currentSelection),
    );
    // After emission we need to reset the multiSelect state, to have a fresh one
    // if another multiSelect opens.
    this._currentSelection = [];
  }

  /** @internal Set pre selected options for the multiSelect input fields. */
  _setInitialSelection(values: DtNodeDef<DtOptionDef>[]): void {
    if (Array.isArray(values)) {
      this._initialSelection = values;
      this._currentSelection = values.slice();
    } else {
      this._initialSelection = [];
    }
    this._checkApplyDisable();
  }

  /** @internal Toggle option from template */
  _toggleOption(event: DtCheckboxChange<DtNodeDef<DtOptionDef>>): void {
    if (event.checked) this._currentSelection.push(event.source.value);
    else
      this._currentSelection = this._currentSelection.filter(
        (opt) => opt !== event.source.value,
      );
    this._checkApplyDisable();
  }

  /** Check if option is selected */
  _isOptionSelected(option: DtNodeDef<DtOptionDef>): boolean {
    return !!this._currentSelection.find((opt) => opt === option);
  }

  private _checkApplyDisable(): void {
    this._applyDisabled =
      this._currentSelection.length === 0 ||
      xor(this._currentSelection, this._initialSelection).length === 0;
  }

  private _filterOptions(): void {
    if (this.inputValue.trim().length > 0) {
      this._filteredOptionsOrGroups = this.optionsOrGroups
        .map((optOrGroup) =>
          isDtGroupDef(optOrGroup)
            ? {
                ...optOrGroup,
                group: {
                  ...optOrGroup.group,
                  options: optOrGroup.group?.options.filter(
                    (option: DtNodeDef<DtOptionDef>) =>
                      option.option?.viewValue
                        .toLowerCase()
                        .includes(this._inputValue),
                  ),
                },
              }
            : optOrGroup,
        )
        .filter((optOrGroup) =>
          isDtGroupDef(optOrGroup)
            ? optOrGroup.group?.options?.length
            : optOrGroup.option.viewValue
                .toLowerCase()
                .includes(this._inputValue),
        );
    } else {
      this._filteredOptionsOrGroups = this.optionsOrGroups;
    }
  }
}
