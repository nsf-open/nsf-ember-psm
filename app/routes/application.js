import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import { hashSettled } from 'rsvp';
import { htmlSafe } from '@ember/string';
import { ApplicationRoute } from 'ember-oauth-iam';
import IAMConfig from 'ember-oauth-iam/configuration';
import SemanticContentConfig from 'ember-semantic-content-data/configuration';

export default ApplicationRoute.extend({

  props: service('properties'),
  permissions: service('permissions'),
  activeUser: service('active-user'),
  session: service('session'),
  cookies: service('cookies'),
  semanticData: service('semantic-content-data'),
  messageService: service('messages'),

  /**
   * beforeSessionRestore: load properties files, when done place environment specific configurations for oauth and
   * header/footer into IAMConfig (oauth) and SemanticContentConfig (header/footer)
   * @returns {boolean}
   */
  beforeSessionRestore() {
    return this.get('props').load().then(() => {
      const semanticsDomain = this.get('props').get('semantics.domain');
      set(SemanticContentConfig, 'domain', semanticsDomain);

      if (this.get('props').get('timeout.pendingExpirationWarning')) {
        set(IAMConfig, 'pendingExpirationWarning', this.get('props').get('timeout.pendingExpirationWarning'));
      }
      if (this.get('props').get('timeout.pendingInactivityWarning')) {
        set(IAMConfig, 'pendingInactivityWarning', this.get('props').get('timeout.pendingInactivityWarning'));
      }
      if (this.get('props').get('timeout.inactivityTimeout')) {
        set(IAMConfig, 'inactivityTimeout', this.get('props').get('timeout.inactivityTimeout'));
      }

      const domain = this.get('props').get('auth.domain');
      set(IAMConfig, 'domain', domain);
    });
  },

  /**
   * beforeModel: set window.Psm.nsfID using either url, cookies or default id. Then load properties service
   * @param params accepts nsfID from url if available
   * @returns {*}
   */
  beforeModel() {
    if (!window.Psm) { window.Psm = {}; }

    if (this.get('session').isAuthenticated) {
      if (this.get('session').get('accessToken')) {
        this.get('activeUser').setToken(this.get('session').get('accessToken'));

        // this.set('userComputed',this.get('session').get('user'));
        // this.set('tokenComputed',this.get('session').get('accessToken'));

        // preload semantic content (header/footer/nav)
        return this.get('semanticData').getAll(this.get('session').get('accessToken'));
      }
    }
  },

  /**
   * model: make api request to get userData using token
   * @param params
   * @returns {*}
   */
  model() {
    // stop this model if we aren't ready with a token
    if (!this.get('activeUser').getToken()) {
      return {};
    }

    return hashSettled({
      user: this.get('activeUser').getActiveUser(),
    }).then((hash) => {
      if (hash.user.state == 'fulfilled') {
        this.get('activeUser').setCurrentUser(hash.user.value);
        if (hash.user.value && hash.user.value.UserData.institutionRoles[0]) {
          window.Psm.institutionID = hash.user.value.UserData.institutionRoles[0].institution.id;
        }
        if (hash.user.value && hash.user.value.UserData && hash.user.value.UserData.institutionRoles) {
          const roleArray = hash.user.value.UserData.institutionRoles;
          for (let i = 0; i < roleArray.length; i += 1) {
            this.get('permissions').addInstitutionRoles(roleArray[i].roles);
          }
        }

        //Add Initial Release/Feedback Request application message
        if (this.get('props.uiFeatureToggles._initialRelease2018')) {
          let content = "<b>Research.gov's new proposal preparation system is now available for preparing and submitting full research non-collaborative proposals</b> <a href='./#/release-timeline' target='_blank'>(Other system capabilities)</a>.";
          if ((!this.get('permissions').hasInstitutionRole('PI') && !this.get('permissions').hasInstitutionRole('co-PI')) && (this.get('permissions').hasInstitutionRole('SPO') || this.get('permissions').hasInstitutionRole('AOR'))) {
            content += ' If you do not see an in progress proposal, have a PI at your organization create a proposal and grant the SPO/AOR access.';
          }
          content += ' NSF welcomes all to give feedback! Proposals prepared in FastLane will continue to be available from FastLane.';

          this.get('messageService').newMessage(this.get('messageService').TYPE_ATTENTION,
            htmlSafe(content), false, this.get('messageService').LEVEL_APP);
        }

        //Add Document formatting application message
        const content = 'Document formatting compliance checks for PDF upload sections have been tested so far with PDFs generated by in Microsoft Word, Google Docs, and Open Office. PDFs generated in other tools such as LaTeX may require your proposal to be submitted through FastLane.';
        this.get('messageService').newMessage(this.get('messageService').TYPE_ATTENTION,
          htmlSafe(content), false, this.get('messageService').LEVEL_APP);


      }
      return hash;
    });
  },

});
