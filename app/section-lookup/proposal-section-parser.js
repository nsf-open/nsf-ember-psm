import {IndicatorType } from '../components/indicator-label';

function proposalSectionParser(proposalSections) {
  Object.keys(proposalSections).forEach((sectionKey) => {
    const isProposalUpdateJustification = sectionKey === 'PUJ';
    const isBudgetImpactStatement = sectionKey === 'BUDI';
    const isBudget = sectionKey === 'BUDGETS';
    const isBudgetJustification = sectionKey === 'BUDGET_JUST';
    const notNonIndicator = !isProposalUpdateJustification && !isBudgetImpactStatement;

    const proposalSection = proposalSections[sectionKey];

    if (isBudget || isBudgetJustification) {
      proposalSection.indicatorType = IndicatorType.RevisionSaved
    }
    else if (notNonIndicator) {
      proposalSection.indicatorType = IndicatorType.UpdatesSaved;
    }
    else {
      proposalSection.indicatorType = IndicatorType.NoIndicator;
    }
  });

  return proposalSections;
}

export default proposalSectionParser;
