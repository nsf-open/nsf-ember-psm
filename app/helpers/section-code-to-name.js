import { helper } from '@ember/component/helper';

export function sectionCodeToName(sectionCode) {
  const sectionReference = [
    {section: 'General', sectionCode: '00'},
    {section: 'Cover Sheet', sectionCode: '01'},
    {section: 'Biographical Sketch', sectionCode: '02'},
    {section: 'Collaborators and Other Affiliations', sectionCode: '03'},
    {section: 'Current and Pending Support', sectionCode: '04'},
    {section: 'Project Summary', sectionCode: '05'},
    {section: 'Project Description', sectionCode: '06'},
    {section: 'Results from Prior NSF Support', sectionCode: '07'},
    {section: 'References Cited', sectionCode: '08'},
    {section: 'Budget(s)', sectionCode: '09'},
    {section: 'Budget Justification(s)', sectionCode: '10'},
    {section: 'Facilities, Equipment and Other Resources', sectionCode: '11'},
    {section: 'Data Management Plan', sectionCode: '12'},
    {section: 'Collaboration Plan', sectionCode: '13'},
    {section: 'Management Plan', sectionCode: '14'},
    {section: 'Postdoctoral Mentoring Plan', sectionCode: '15'},
    {section: 'Deviation Authorization', sectionCode: '16'},
    {section: 'Letter of Support', sectionCode: '17'},
    {section: 'RUI Impact Statement', sectionCode: '18'},
    {section: 'List of Suggested Reviewers', sectionCode: '19'},
    {section: 'List of Reviewers Not to Include', sectionCode: '20'},
    {section: 'Nature of Natural or Anthropogenic Event', sectionCode: '21'},
    {section: 'Other Personnel Biographical Information', sectionCode: '22'},
    {section: 'Senior Personnel Documents', sectionCode: '23'}
  ];

  return sectionReference.findBy('sectionCode', sectionCode[0]).section;
}

export default helper(sectionCodeToName);
