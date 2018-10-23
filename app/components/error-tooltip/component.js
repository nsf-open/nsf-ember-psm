import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import $ from 'jquery';

const ErrorTooltipComponent = Component.extend({

  tooltip: null,
  inputElement: null,

  tagName: 'i',
  classNames: ['error-tooltip', 'fa', 'fa-exclamation-circle', 'error-icon'],
  attributeBindings: ['dataToggle:data-toggle', 'dataTitle:title'],
  dataToggle: 'tooltip',

  originalTipText: null,

  dataTitle: computed('params.0', function() {
    return `<div>${htmlSafe(this.get('params')[0])}</div>` +
    '<button type="button" class="close-tooltip" data-dismiss="popover" aria-label="Close"><i class="fa fa-window-close" aria-hidden="true"></i></button>';
  }),

  willInsertElement() {
    this.set('errorValue', this.get('params')[0]);
  },

  didUpdateAttrs() {
    if (this.get('params')[0] == this.get('originalTipText')) { // if text hasn't changed, do not re-show the tooltip
      return;
    }
    this.set('originalTipText', this.get('params')[0]);

    const tooltip = this.get('tooltip');

    tooltip.tooltip('hide')
      .attr('title', this.get('dataTitle'))
      .tooltip('fixTitle')
      .tooltip('show');
  },

  didInsertElement() {
    const tooltip = $(`#${this.element.id}`);
    this.set('tooltip', tooltip);

    const inputElement = tooltip.parent().find('input');
    this.set('inputElement', inputElement);

    inputElement.addClass('error');

    this.set('originalTipText', this.get('params')[0]); // set originalTipText for comparison in didUpdateAttrs

    tooltip.tooltip({ trigger: 'manual', html: true, animation: false})
      .on('click', function() {
        tooltip.tooltip('show');
      }).on('shown.bs.tooltip', function() {
        tooltip.parent().find('.close-tooltip').on('click', function() {
          tooltip.tooltip('hide');
        });
      });

    tooltip.tooltip('show');
  },

  willDestroyElement() {
    this.get('inputElement').removeClass('error');
    this.get('tooltip').off('mouseenter').off('shown.bs.tooltip');
    this.get('tooltip').tooltip('destroy');
  }

});

ErrorTooltipComponent.reopenClass({
  positionalParams: 'params'
});

export default ErrorTooltipComponent;
