import Service from '@ember/service';
import { debounce } from '@ember/runloop';
import $ from 'jquery';

export default Service.extend({
  desktopBreakpoint: 1200,
  tabletBreakpoint: 940,
  isDesktop: false,
  isTablet: false,
  isMobile: true,
  init() {
    this._super(...arguments);
    const self = this;
    self.environmentCheck(); // Call to set environment variables at application start
    $(window).resize(function() {
      debounce(self, self.environmentCheck, 1000);
    });
  },
  environmentCheck() {
    const self = this;
    const desktopSize = self.get('desktopBreakpoint');
    const tabletSize = self.get('tabletBreakpoint');
    if (window.matchMedia(`(min-width: ${desktopSize}px)`).matches) {
      self.set('isDesktop', true);
      self.set('isTablet', false);
      self.set('isMobile', false);
    }
    else if (window.matchMedia(`(min-width: ${tabletSize}px) and (max-width: ${desktopSize}px)`).matches) {
      self.set('isDesktop', false);
      self.set('isTablet', true);
      self.set('isMobile', false);
    }
    else {
      self.set('isDesktop', false);
      self.set('isTablet', false);
      self.set('isMobile', true);
    }
  }
});
