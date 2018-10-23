export default function( server ) {

  server.loadFixtures('proposals');

  server.createList('fundingopportunity', 1000);
  // server.loadFixtures('fundingopportunities');

  server.loadFixtures('personnels');

  // Seed your development database using your factories. This
  // data will not be loaded in your tests.

  // server.createList('contact', 10);
}
