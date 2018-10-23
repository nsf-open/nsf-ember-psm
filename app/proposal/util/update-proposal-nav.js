/* updateNavByLinkName needs to be used with an execution context
/* i.e updateNavByLinkName.bind(this, ...) or updateNavByLinkName.call(this, ...)
 */


function updateNavByLinkName(linkName, sendFunc) {
  if (['proposal.index', 'proposal'].indexOf(linkName) === -1) {
    sendFunc('insertMenu');
    if (linkName !== 'proposal') {
      if (linkName.indexOf('proposal.') !== -1) {
        linkName = linkName.substring(linkName.indexOf('proposal.') + 9, linkName.length);
      }
      if (linkName.indexOf('.') !== -1) {
        linkName = linkName.substring(0, linkName.indexOf('.'));
      }
    }
  }
  else {
    sendFunc('removeMenu');
  }
}

export {
  updateNavByLinkName
}
