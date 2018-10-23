import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import $ from 'jquery';


const ClickPopoverIconTooltipComponent = Component.extend({

  tagName: 'a',
  classNames: ['click-popover'],
  attributeBindings: [
    'dataOriginalTitle:data-original-title',
    'dataToggle:data-toggle',
    'dataContent:data-content',
    'dataPlacement:data-placement',
    'tabIndex:tabindex'
  ],
  dataToggle: 'popover',
  iconTitle: 'Information Tooltip',
  hasLineBreak: false,
  tabIndex: '0',

  dataOriginalTitle: computed('params.[]', function() {
    return this.get('params')[0];
  }),
  dataContent: computed('params.[]', function() {
    return htmlSafe(this.get('params')[1]);
  }),
  dataPlacement: computed('params.[]', function() {
    return this.get('params')[2] || 'right';
  }),
  linkWording: computed('params.[]', function() {
    return htmlSafe(this.get('params')[3]);
  }),

  didInsertElement() {
    $(`#${this.elementId}`).popover({ trigger: 'manual', html: true, animation: false})
      .on('click keyup', function(event) {
        if (event.type === 'keyup' && event.keyCode !== 9) return false;

        $(this).popover('toggle');
        $(this).find('i').attr('title', '');
      }).on('shown.bs.popover', function() {
        const popover = $(this);
        $(this).parent().find('.close').on('click', function() {
          popover.popover('hide');
        });
      });
  },
  willDestroyElement() {
    $('[data-toggle="popover"]').popover('destroy');
  }
});

ClickPopoverIconTooltipComponent.reopenClass({
  positionalParams: 'params'
});

export default ClickPopoverIconTooltipComponent;
