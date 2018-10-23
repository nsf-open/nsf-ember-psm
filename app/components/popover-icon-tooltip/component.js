import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import $ from 'jquery';


const PopoverIconTooltipComponent = Component.extend({

  tagName: 'a',
  classNames: ['hover-popover'],
  attributeBindings: ['href', 'dataOriginalTitle:data-original-title', 'dataToggle:data-toggle', 'dataTrigger:data-trigger', 'dataContent:data-content', 'dataPlacement:data-placement'],
  // href: '#',
  dataToggle: 'popover',
  dataTrigger: 'hover',
  iconTitle: 'Information Tooltip',

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
    /* $('[data-toggle="popover"]')*/
      $('.hover-popover').popover({ trigger: 'manual', html: true, animation: false})
      .on('mouseenter', function () {
        const _this = this;
        $(this).popover('show');
        $(this).find('i').attr('title', '');
        $('.popover').on('mouseleave', function () {
          $(_this).popover('hide');
          $(_this).find('i').attr('title', _this.iconTitle);
        });
      }).on('mouseleave', function () {
        const _this = this;
        setTimeout(function () {
          if (!$('.popover:hover').length) {
            $(_this).popover('hide');
            $(_this).find('i').attr('title', _this.iconTitle);
          }
        }, 300);
      });
  },
  willDestroyElement() {
    $('[data-toggle="popover"]').popover('destroy');
  },

  init(...args) {
    this._super(args);
    this.tabIndex = this.tabIndex || '0';
  },

  actions: {
    onHover(event) {
      if (event.keyCode === 9) {
        $(this.get('element')).popover('show');
      }
    },
    closeModal() {
      $(this.get('element')).popover('hide');
    }
  }
});

PopoverIconTooltipComponent.reopenClass({
  positionalParams: 'params'
});

export default PopoverIconTooltipComponent;
