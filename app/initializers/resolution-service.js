import Resolution from '../services/resolution';

export function initialize(App) {
  App.register('resolution:main', Resolution, { singleton: true });
  App.inject('component', 'Resolution', 'service:resolution');
  App.inject('controller', 'Resolution', 'service:resolution');
}

export default {
  name: 'resolution-service',
  initialize
};
