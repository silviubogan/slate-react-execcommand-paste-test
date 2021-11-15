import logo from './logo.svg';
import React, { useMemo, useState } from 'react';
import './App.css';
import { Slate, withReact, Editable } from 'slate-react';
import { createEditor, Transforms } from 'slate';
import { jsx } from 'slate-hyperscript';

const ELEMENT_TAGS = {
  B: () => ({ type: 'b' }),
  P: () => ({ type: 'p' }),
};

const TEXT_TAGS = {

};

export const deserialize = el => {
  if (el.nodeType === 3) {
    return el.textContent;
  }
  if (el.nodeType !== 1) {
    return null;
  }
  if (el.nodeName === 'BR') {
    return '\n';
  }

  const { nodeName } = el;

  let parent = el;

  if (nodeName === 'PRE' && el.childNodes[0] && el.childNodes[0].nodeName === 'CODE') {
    parent = el.childNodes[0];
  }

  let children = Array.from(parent.childNodes).map(deserialize).flat();

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx('element', attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map(child => jsx('text', attrs, child));
  }

  return children;
}

const withHtml = editor => {
  const { insertData, isInline } = editor;

  editor.isInline = (n) => {
    return n.type === 'b' ? true : isInline(n);
  };

  editor.insertData = data => {
    const html = data.getData("text/html");

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const fragment = deserialize(parsed.body);
      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};

const MyElement = ({ children, attributes, element }) => {
  switch (element.type) {
    case 'p':
      return <p {...attributes}>{children}</p>;
    case 'b':
      return <b {...attributes}>{children}</b>;
    default:
      throw new Error('Unknown element type');
  }
};

function App() {
  const editor = useMemo(() => withHtml(withReact(createEditor())), []);

  const [val, setVal] = useState([{
    type: 'p',
    children: [{
      text: 'initial value'
    }]
  }]);

  // TODO: Cypress test which does a paste of HTML into the editor

  return (
    <div className="App">
      <header className="App-header">
        <Slate editor={editor} value={val} onChange={(v) => { setVal(v) }}>
          <Editable renderElement={MyElement} />
        </Slate>
      </header>
    </div>
  );
}

export default App;
