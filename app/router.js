import EmberRouter from '@ember/routing/router';
import { inject as service } from '@ember/service';
import config from './config/environment';
import { RouterSupportMixin } from 'ember-webtrend-analytics';

const Router = EmberRouter.extend(RouterSupportMixin, {
  location: config.locationType,
  props: service('properties')

});

Router.map(function() {
  // this.route('proposals');

  this.route('proposal', {path: '/proposal/:prop_prep_id/:prop_rev_id'}, function() {
    this.route('manage-personnel'); // Manage Personnel

    this.route('proposal-access', function() {
      this.route('change-access');
    });

    this.route('proposal-update-justification');
    this.route('budget-impact-statement');

    this.route('budgets');
    this.route('budget-justification'); // Budget Justification


    this.route('cover-sheet');
    this.route('data-management-plan', { path: '/dmp' });

    this.route('facilities-equipment'); // Facilities, Equipment, & Other Resources

    this.route('postdoc-mentoring-plan'); // Postdoctoral Mentoring Plan
    this.route('project-description'); // Project Description
    this.route('project-summary'); // Project Summary
    this.route('project-text-editors'); // Project Text Editors
    this.route('references-cited'); // References Cited

    this.route('sr-personnel-documents', function() {
      // Senior Personnel Documents
      this.route('bio-sketch', {path: '/:personnel_id/bio-sketch'}); // Bio Sketch
      this.route('support', {path: '/:personnel_id/support'}); // Current and Pending Support
      this.route('collaborators', {path: '/:personnel_id/collaborators'}); // Collaborators and Other Affiliations
    });

    this.route('suggested-reviewers');
    this.route('reviewers-not-included');
    this.route('other-personnel-bio-info');
    this.route('other-supplementary-docs');

    this.route('submit');
  });

  // Proposal Prep
  this.route('proposal-prep');

  // Release Timeline - Static Screen
  this.route('release-timeline');

  // In Progress and Submitted Proposals
  this.route('proposals', {path: 'proposals/:proposals_type'}, function() {

  });

  // Creation Wizard
  this.route('wizard', {path: '/create'});

  // Page Not Found
  this.route('page-not-found', { path: '/*wildcard' });

  this.route('error');

  this.route('auth-request');

  return undefined;
});

export default Router;
