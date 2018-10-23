import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('single-file-upload', 'Integration | Component | single file upload', {
  integration: true
});

test('component:single-file-upload it renders', function(assert) {
  this.render(hbs`{{single-file-upload-with-messages-service}}`);

  assert.equal(this.$('div.uploaded-file').text().trim(), 'Currently, no file has been uploaded');
});

test('component:single-file-upload when currentFileName exists, properties set correctly', function(assert) {
  this.render(hbs`{{single-file-upload-with-messages-service fileName=filename sectionInfo=sectionInfo apiPath="apis.fileUpload" maxFileSize=10000000 allowableFileTypes=[".pdf"]}}`);

  assert.equal(this.$('.filename-saved').is(':visible'), false);
  assert.equal(this.$('.filename-saved i').hasClass('fa-file-pdf-o'), false);
  assert.equal(this.$('.filename-saved-delete').is(':visible'), false);

  this.set('sectionInfo', {'camelCaseName': 'projSummary', 'entryType': 'UPLOAD', 'code': '05', 'name': 'Project Summary'});
  this.set('proposalDetails', {'propPrepId': 4360, 'propRevId': 3458});
  this.set('filename', 'FastLane.pdf');

  assert.equal(this.$('.filename-saved').is(':visible'), true);
  assert.equal(this.$('.filename-saved i').hasClass('fa-file-pdf-o'), true);

  this.set('filename', '');

  assert.equal(this.$('.filename-saved').is(':visible'), false);
  assert.equal(this.$('.filename-saved i').hasClass('fa-file-pdf-o'), false);
  assert.equal(this.$('.filename-saved-delete').is(':visible'), false);
});
