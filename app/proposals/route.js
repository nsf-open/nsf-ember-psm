import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Route.extend({

  messageService: service('messages'),
  props: service('properties'),
  permissions: service('permissions'),

  messageTexts: computed('props', function() {
    return {
      'in_progress_spo_aor_fl': `If you have in progress proposals that were created in FastLane, you will find them listed on FastLane's <a id='fastlane-ram-inprogress' href='${this.get('props.fastLaneLinks.flRAM')}' target='_blank'>Documents in Progress</a> page.`,
      'submitted_spo_aor_fl': `If you have submitted proposals that were created in FastLane, you will find them listed on FastLane's <a id='fastlane-ram-submitted' href='${this.get('props.fastLaneLinks.flRAM')}' target='_blank'>Submitted Documents</a> page.`
    };
  }),


  model(params) {
    const { proposals_type: proposalsType } = params;
    let proposalsTypeTitle, proposalsPageTitle;

    if (proposalsType === 'inprogress') {
      proposalsTypeTitle = 'In Progress Proposals';
      proposalsPageTitle = 'NSF In Progress Proposals';
    }
    else if (proposalsType === 'submitted') {
      proposalsTypeTitle = 'Submitted Proposals';
      proposalsPageTitle = 'NSF Submitted Proposals'
    }

    if (this.get('permissions').hasInstitutionRole('SPO') || this.get('permissions').hasInstitutionRole('AOR')) {
      const message = {
        status: 'info',
        dismissable: false,
        level: this.get('messageService').LEVEL_SCREEN,
        displayRoute: 'proposals.index'
      };

      if (proposalsType === 'inprogress') {
        message.message = htmlSafe(this.get('messageTexts').in_progress_spo_aor_fl);
      }
      else if (proposalsType === 'submitted') {
        message.message = htmlSafe(this.get('messageTexts').submitted_spo_aor_fl);
      }
      this.get('messageService').addMessage(message);
    }

    return {
      proposalsTypeTitle,
      proposalsPageTitle
    }
  },

});
