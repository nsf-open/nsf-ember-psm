import Service from '@ember/service';



function singleBaseSetup() {
  const messagesServiceStub = Service.extend({
    init(...args) {
      this._super(...args);
    }
  });

  const proposalDocumentStub = Service.extend({
    init(...args) {
      this._super(...args);
    }
  });

  const transitionServiceStub = Service.extend({
    init(...args) {
      this._super(...args);
    }
  });

  return {
    singleBaseSetup() {
      const services = [
        { serviceName: 'messages', ref: 'messagesService', stub: messagesServiceStub},
        { serviceName: 'proposal-document', ref: 'proposalDocumentService', stub: proposalDocumentStub},
        { serviceName: 'transition', ref: 'transitionService', stub: transitionServiceStub}
      ];

      services.forEach((serviceInfo) => {
        const { serviceName, ref , stub } = serviceInfo;
        this.register(`service:${serviceName}`, stub);
        this.inject.service(serviceName, { as: ref });
      })
    },
    messagesServiceStub,
    proposalDocumentStub,
    needs: ['service:properties', 'service:webtrend-analytics', 'service:proposal-constants', 'service:customForm']
  }
}

export {
  singleBaseSetup
}
