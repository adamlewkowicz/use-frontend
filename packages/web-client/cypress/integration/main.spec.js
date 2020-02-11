/// <reference types="Cypress" />

describe('Homepage', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('example change', async () => {
    cy.findByText('Example').click();
  });

  it('modal', () => {
    cy.findByText('Compare').click();

    cy.findByRole('dialog').should('exist');

    // cy.queryBy.click();

    cy.findByRole('dialog').should('not.exist');
  });

});