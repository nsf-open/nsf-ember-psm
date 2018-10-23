
export default [
  {
    tempProposalId: 1234567,
    proposalTitle: 'A sample proposal, powered by Mirage',
    fundingOp : {
      fundingOpportunityId: 'NSF 15-555',
      fundingOpportunityTitle: 'Faculty Early Career Development Program'
    },

    proposalType: 'Research', //Travel, Ideas Lab
    submissionType: 'Letter of Intent', //Full Proposal, Renewal
    uocs: [
      {
        directorate: {
          directorateAbbrv: "MPS",
          directorateCode: "03000000",
          directorateLongName: "Direct For Mathematical & Physical Scien",
          directorateName: "Direct For Mathematical & Physical Scien"
        },
        division: {
          divisionCode: "03020000",
          divisionName: "Division Of Astronomical Sciences",
          divisionAbbrv: "AST",
          divisionLongName: "Division Of Astronomical Sciences"
        },
        programElement: {
          programElementCode: "1219",
          programElementName: "SPECIAL PROGRAMS IN ASTRONOMY",
          programElementLongName: "SPECIAL PROGRAMS IN ASTRONOMY"
        }
      },
      {
        directorate: {
          directorateAbbrv: "SBE",
          directorateCode: "04000000",
          directorateLongName: "Direct For Social, Behav & Economic Scie",
          directorateName: "Direct For Social, Behav & Economic Scie"
        },
        division: {
          divisionCode: "04050000",
          divisionName: "Divn Of Social and Economic Sciences",
          divisionAbbrv: "SES",
          divisionLongName: "Divn Of Social and Economic Sciences"
        },
        programElement: {
          programElementCode: "8020",
          programElementName: "Cyberlearn & Future Learn Tech",
          programElementLongName: "Cyberlearn & Future Learn Tech"
        }
      },
      {
        directorate: {
          directorateAbbrv: "CSE",
          directorateCode: "05000000",
          directorateLongName: "Direct For Computer & Info Scie & Enginr",
          directorateName: "Direct For Computer & Info Scie & Enginr"
        },
        division: {
          divisionCode: "05020000",
          divisionName: "Div Of Information & Intelligent Systems",
          divisionAbbrv: "IIS",
          divisionLongName: "Div Of Information & Intelligent Systems"
        },
        programElement: {
          programElementCode: "7382",
          programElementName: "Computing Ed for 21st Century",
          programElementLongName: "Computing Ed for 21st Century"
        }
      }
    ],

    sections: [
      {
        sectionTitle: 'Cover Sheet',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'required' //'conditional', 'optional'
      },
      {
        sectionTitle: 'Senior Personnel Documents',
        status: 'notStarted', //'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notChecked', 'notCompliant', 'compliant'
        sectionPath: 'proposal.sr-personnel-documents',
        requirement: 'required', //'conditional', 'optional'
        note: "Required documents for Senior Personnel include: <ul><li>Biographical Sketch</li><li>Collaborators &amp; Other Affiliations</li><li>Current &amp; Pending Support</li></ul>"
      },
      {
        sectionTitle: 'Project Summary',
        status: 'notStarted', //'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notChecked', 'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'required' //'conditional', 'optional'
      },
      {
        sectionTitle: 'Project Description',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'required' //'conditional', 'optional'
      },
      {
        sectionTitle: 'References Cited',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'required' //'conditional', 'optional'
      },
      {
        sectionTitle: 'Budgets',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal.budgets',
        requirement: 'required' //'conditional', 'optional'
      },
      {
        sectionTitle: 'Budgt Justification',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'required' //'conditional', 'optional'
      },
      {
        sectionTitle: 'Facilities, Equipment, and Other Resources',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'required' //'conditional', 'optional'
      },
      {
        sectionTitle: 'Data Management Plan',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'required' //'conditional', 'optional'
      },
      {
        sectionTitle: 'Collaboration Plan',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'required' //'conditional', 'optional'
      },
      {
        sectionTitle: 'Management Plan',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'required' //'conditional', 'optional'
      },
      {
        sectionTitle: 'Postdoctoral Mentoring Plan',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'conditional', //'conditional', 'optional'
        note: " "
      },
      {
        sectionTitle: 'Deviation Authorization',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'conditional', //'conditional', 'optional'
        note: " "
      },
      {
        sectionTitle: 'Letters of Support',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'optional' //'conditional', 'optional'
      },
      {
        sectionTitle: 'RUI Impact Statement',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'optional' //'conditional', 'optional'
      },
      {
        sectionTitle: 'Suggested Reviewer List',
        status: 'notStarted',
        lastUpdateDate: null, //{return new Date();},
        compliance: 'notChecked', //'notCompliant', 'compliant'
        sectionPath: 'proposal',
        requirement: 'optional', //'conditional', 'optional'
        note: " "
      }
    ]

  }
];
