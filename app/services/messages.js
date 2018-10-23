import { getOwner } from '@ember/application';
import Service from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

import $ from 'jquery';

export default Service.extend({

/**
  The message model
  message = {
    "status": "ERROR|WARNING|INFO|SUCCESS",
    "message": "Content of the message",
    "dismissable": "true|false",
    "level": "APPLICATION|PROPOSAL|SCREEN|ACTION|(?)CROSS-SCREEN",
    "displayRoute": "proposal.something", //the screen on which a cross screen message should display
    "persist": true // whether or not the message should stay while navigating away and back. must include a displayRoute
  }
*/
  messages: null,

  /* LEVEL CONSTANTS*/
  LEVEL_ACTION: 'ACTION', // messages shown because a user takes an action like "save," "open coversheet preview", which should be cleared when a new action is taken
  LEVEL_SCREEN: 'SCREEN', // messages shown on a given screen, not to be cleared when an action is taken, and cleared when leaving a screen
  LEVEL_CROSS_SCREEN: 'CROSS_SCREEN', // CROSS_SCREEN messages must have 'displayRoute', the route on which this message should display
  LEVEL_PROPOSAL: 'PROPOSAL', // messages that show on all screens in the proposal
  LEVEL_APP: 'APP', // messages that show on all screens in the application

  /* NOTIFICATION TYPE CONSTANTS*/
  // TYPE_ERROR: "ERROR",
  // TYPE_WARNING: "WARNING",
  // TYPE_INFO: "INFO",
  // TYPE_SUCCESS: "SUCCESS",
  TYPE_ATTENTION: 'ATTENTION',

  init() {
    this._super(...arguments);
    this.set('messages', []);
  },

  appLevelMessages: computed('messages.[]', function() {
    return this.getMessagesByLevel(this.LEVEL_APP);
  }),


  /**
   * Add a messageObject to the messages array
   * This method will accept the following arguments:
   * A message object {status, message (, dismissable, level, displayRoute )}
   * defaults dismissable to true
   * defaults level to ACTION (lowest level)
   *
   * @method addMessage
   *
   * @example
   * addMessage(messageObject)
   * addMessage({status:"INFO", message:"You have View Only access."})
   * addMessage({status:"INFO", message:"You have View Only access.", dismissable: false, level: this.LEVEL_PROPOSAL})
   * addMessage({status:"SUCCESS", message:"The proposal was submitted successfully.", dismissable: true, level: this.CROSS_SCREEN, displayRoute: 'proposals'})
   * this.get('messageService').addMessage(messageObject)
  */
  addMessage(message) {
    if (!Object.prototype.hasOwnProperty.call(message, 'dismissable')) {
    // if (!message.hasOwnProperty('dismissable')) { // default dismissable true
      message.dismissable = true;
    }
    if (!Object.prototype.hasOwnProperty.call(message, 'level')) {
    // if (!message.hasOwnProperty('level')) { // default to action level
      message.level = this.LEVEL_ACTION;
    }
    if (!Object.prototype.hasOwnProperty.call(message, 'displayRoute')) {
      message.displayRoute = '';
    }
    if (!Object.prototype.hasOwnProperty.call(message, 'persist')) {
      message.persist = false;
    }

    this.get('messages').pushObject(message);

    if (message.level !== this.LEVEL_CROSS_SCREEN && message.level !== this.LEVEL_APP ) { // Scroll to top, unless the message is CROSS_SCREEN

      const checkExist = setInterval(function() {
       if ($('#messageAnchor').length) {

          const elementTop = $("#messageAnchor").offset().top;
          const elementBottom = elementTop + $("#messageAnchor").outerHeight();
          const viewportTop = $(window).scrollTop();
          const viewportBottom = viewportTop + $(window).height();
          const isInViewport = elementBottom > viewportTop && elementTop < viewportBottom;

          if (!isInViewport) {
            $('html,body').stop(true, false).animate({scrollTop: $("#messageAnchor").offset().top}, 'slow');
          }

          clearInterval(checkExist);
       }
      }, 100); // check every 100ms

    }
  },

  addAllMessages(messages) {
    messages.forEach(message => {
      this.addMessage(message);
    });
  },

  /**
   * Create a new message and add it to the messages array
   * This method will accept the following arguments:
   * A string status
   * A string message
   * An optional boolean dismissable, defaults to true
   * An optional string level, defaults to ACTION
   * An optional string displayRoute
   *
   * @method newMessage
   *
   * @example
   * newMessage("INFO","You have View Only access.")
   * newMessage("INFO", "You have View Only access.", false, this.LEVEL_PROPOSAL)
   * newMessage("SUCCESS", "The proposal was submitted successfully.",true, this.CROSS_SCREEN, 'proposals')
   * this.get('messageService').newMessage("INFO","You have View Only access.")
  */
  newMessage(status, messageContent, dismissable, level, displayRoute, persist) {
    const message = {
      'status': status,
      'message': messageContent
    };
    if (!isEmpty(dismissable)) {
      message.dismissable = dismissable;
    }
    else {
      message.dismissable = true;
    }
    if (level) {
      message.level = level;
    }
    if (displayRoute) {
      message.displayRoute = displayRoute;
    }
    if (!isEmpty(persist)) {
      message.persist = persist;
    }
    else {
      message.persist = false;
    }
    this.addMessage(message);
  },


  /**
   * Clear messages on the ACTION level for (generated by) the current screen/route
   *
   * @method clearActionMessages
   *
  */
  clearActionMessages() {
    this.clearMessagesByLevel(this.LEVEL_ACTION);
  },


  /**
   * Clear messages on the SCREEN level for (generated by) the current screen/route.
   * ALSO clears CROSS_SCREEN messages that were displayed on the current screen/route (generated by a different screen/route).
   * ALSO clears all ACTION level messages.
   *
   * @method clearScreenMessages
   *
  */
  clearScreenMessages() {
    this.clearActionMessages();
    this.clearCrossScreenMessagesForThisRoute();
    this.clearMessagesByLevel(this.LEVEL_SCREEN);
  },


  /**
   * Clear all CROSS_SCREEN level messages.
   *
   * @method clearCrossScreenMessages
   *
  */
  clearCrossScreenMessages() {
    this.clearMessagesByLevel(this.LEVEL_CROSS_SCREEN);
  },


  /**
   * Clear messages on the PROPOSAL level for (generated by) this proposal.
   * ALSO clears all SCREEN level messages.
   * ALSO clears all CROSS_SCREEN messages. TODO: SHOULD THIS BE CLEARED?
   * ALSO clears all ACTION level messages.
   *
   * @method clearProposalMessages
   *
  */
  clearProposalMessages() {
    this.clearScreenMessages();
    // this.clearCrossScreenMessages(); //TODO: SHOULD THIS BE CLEARED?
    this.clearMessagesByLevel(this.LEVEL_PROPOSAL);
  },


  /**
   * Clear messages on a single level
   * This method will accept the following arguments:
   * A single level
   *
   * @method clearMessagesByLevel
   *
   * @example
   * clearMessagesByLevel(this.LEVEL_ACTION)
   * this.get('messageService').clearMessagesByLevel(this.get('messageService').LEVEL_ACTION)
  */
  clearMessagesByLevel(level) {
    let messages = this.get('messages');
    messages = messages.rejectBy('level', level);
    this.set('messages', messages);
  },


  /**
   * Clear all CROSS_SCREEN level messages for the current screen/route (generated by a different screen/route).
   * This method will accept the following arguments:
   * A single route
   *
   * @method clearCrossScreenMessagesForSpecificScreen
   *
   * @example
   * clearCrossScreenMessagesForSpecificScreen('proposal.manage-personnel')
   */
  clearCrossScreenMessagesForSpecificScreen(route) {
    const removedMessages = this.get('messages').filterBy('displayRoute', route).filterBy('persist', false);
    this.get('messages').removeObjects(removedMessages);
  },


  /**
   * Clear all CROSS_SCREEN level messages for the current screen/route (generated by a different screen/route).
   *
   * @method clearCrossScreenMessagesForThisRoute
   *
  */
  clearCrossScreenMessagesForThisRoute() {
    const currentRoute = getOwner(this).lookup('router:main').get('currentRouteName');
    this.clearCrossScreenMessagesForSpecificScreen(currentRoute);
  },


  /**
   * Clear dismissable messages of a single status (error, warning, info, or success)
   * This method will accept the following arguments:
   * A single status
   *
   * @method clearDismissableMessagesByStatus
   *
   * @example
   * clearDismissableMessagesByStatus('error')
   * clearDismissableMessagesByStatus('ERROR')
   * clearDismissableMessagesByStatus(this.TYPE_ERROR)
   * this.get('messageService').clearDismissableMessagesByStatus(this.get('messageService').TYPE_ERROR)
  */
  clearDismissableMessagesByStatus(status) {
    const removedMessages = this.get('messages').filterBy('status', status).filterBy('dismissable', true);
    this.get('messages').removeObjects(removedMessages);
  },

  clearActionMessagesByStatus(status) {
    const screenMessages = this.getMessagesByLevel(this.LEVEL_ACTION);
    const removedMessages = screenMessages.filterBy('status', status);
    this.get('messages').removeObjects(removedMessages);
  },

  /**
   * Clear messages that have a specific id property. This allows setting persistent messages
   * and clearing them specific to one endpoint or block of code
   *
   * @method clearMessagesById
   *
   * @example
   * clearMessagesById('getProposal')
   */
  clearMessagesById(messageId) {
    const removedMessages = this.get('messages').filterBy('id', messageId);
    this.get('messages').removeObjects(removedMessages);
  },


  /**
   * Clear all messages
   *
   * @method clearAllMessages
  */
  clearAllMessages() {
    this.get('messages').clear();
  },


  /**
   * Get all messages of a single level (APP, PROPOSAL, SCREEN, CROSS_SCREEN, or ACTION)
   * This method will accept the following arguments:
   * A single level constant
   *
   * @method getMessagesByLevel
   *
   * @example
   * getMessagesByLevel(this.LEVEL_SCREEN) --> get all SCREEN level messages
   * this.get('messageService').getMessagesByLevel(this.get('messageService').LEVEL_SCREEN) --> get all SCREEN level messages
  */
  getMessagesByLevel(levelConstant) {
    const messages = this.get('messages');
    if (isEmpty(messages)) { return messages; }
    return messages.filterBy('level', levelConstant).uniqBy('message');
  },

  containsMessage(messageString) {
    const messages = this.get('messages');
    return messages.filterBy('message', messageString).length > 0;
  }

});
