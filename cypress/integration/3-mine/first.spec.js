/// <reference types="cypress" />

// import { insertHtmlIntoEditor } from 'volto-slate/editor/extensions/insertData';

describe('Block Tests', () => {
  it('some test', () => {
    cy.visit('http://localhost:3000');

    // sadly, makes the test fail
    // see: https://stackoverflow.com/questions/69798980/how-to-use-the-blob-constructor-inside-a-cypress-plugin
    // cy.task('setClipboardHtml', '<strong>Epic</strong>');

    cy.window().then((win) => {
      // TODO: make the p display: none, and copy just the strong inside it
      cy.wrap(win.document.body).invoke(
        'prepend',
        '<p id="clipboard-mock"><b>HELLO, WORLD!</b></p>',
      );
      return cy.document().then((d) => {
        const s = d.getSelection();
        if (s.rangeCount > 0) {
          s.removeAllRanges();
        }

        const r = document.createRange();
        r.selectNodeContents(d.getElementById('clipboard-mock'));
        s.addRange(r);

        return cy.document().invoke('execCommand', 'copy');
      });
    });

    cy.get('[contenteditable]')
      .focus()
      .click();

    cy.wait(1000);

    cy.document().invoke('execCommand', 'paste');

    cy.wait(1000);

    // cy.get('[contenteditable]').blur();

    // insertHtmlIntoEditor(window.focusedSlateEditor, '<strong>SupeR</strong>');

    // getSlateBlockValue(cy.get('.slate-editor').first()).then((val) => {
    //   expect(val).to.deep.eq([
    //     {
    //       type: 'p',
    //       children: [{ text: 'hello, ' }],
    //     },
    //   ]);
    // });
    // getSlateBlockValue(cy.get('.slate-editor').eq(1)).then((val) => {
    //   expect(val).to.deep.eq([
    //     {
    //       type: 'p',
    //       children: [{ text: 'world' }],
    //     },
    //   ]);
    // });

    // // Save
    // cy.toolbarSave();

    // cy.contains('hello, ');
    // cy.contains('world');
  });
});
