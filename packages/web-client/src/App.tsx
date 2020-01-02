import React, { useState } from 'react';
// @ts-ignore
import logo from './logo.svg';
import './App.css';
import * as babelHooksToCompositionPlugin from 'babel-plugin-hooks-to-composition';
import * as babel from '@babel/core';

const defaultCode = `
  const [counter, setCounter] = useState(0);

  setCounter(c => c + 1);
`.trim();

export function App() {
  const [code, setCode] = useState(defaultCode);

  const transformedCode = babel.transform(code, {
    plugins: [babelHooksToCompositionPlugin],
    retainLines: true
  });

  return (
    <div className="App">
      <header className="App-header">
        <textarea
          value={code}
          onChange={(e => setCode(e.target.value))}
        />
        <pre>
          {transformedCode}
        </pre>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
