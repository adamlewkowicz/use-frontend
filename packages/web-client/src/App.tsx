import React, { useState } from 'react';
// @ts-ignore
import logo from './logo.svg';
import './App.css';
import * as babelHooksToCompositionPlugin from 'babel-plugin-hooks-to-composition';
import * as babel from '@babel/core';
import { split } from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-textmate';

const SplitEditor = split  as any;

const defaultCode = `
function useCounter() {
  const [counter, setCounter] = useState(0);
  
  const increment = () => setCounter(c => c + 1);
  
  return { counter, increment };
}
`.trim();

export function App() {
  const [reactCode, setReactCode] = useState(defaultCode);

  // const transformedCode = babel.transform(code, {
  //   plugins: [babelHooksToCompositionPlugin],
  //   retainLines: true
  // });

  return (
    <div className="App">
      <SplitEditor
        mode="javascript"
        splits={2}
        theme="textmate"
        fontSize={14}
        value={[reactCode, reactCode]}
        onChange={([reactCode]: any) => {
          setReactCode(reactCode);
        }}
        style={{ width: '80vw', height: '80vh', margin: '50px auto' }}
        enableBasicAutocompletion      
      />
      <header className="App-header">
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
