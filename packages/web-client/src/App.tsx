import React, { useState } from 'react';
// @ts-ignore
import logo from './logo.svg';
import './App.css';
import { hooksToCompositionPlugin } from 'babel-plugin-hooks-to-composition';
import * as babel from '@babel/core';
import { split } from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-textmate';
import { useWebWorker } from './hooks/use-web-worker';
// @ts-ignore
import WorkerModule from './web-worker/babel-transform.worker.js';
import { transformCode } from './utils';

const SplitEditor = split  as any;

const defaultCode = `
function useCounter() {
  const [counter, setCounter] = useState(0);
  
  const increment = () => setCounter(c => c + 1);
  
  return { counter, increment };
}
`.trim();

export function App() {
  const [reactCode, setReactCode] = useState<string>(defaultCode);
  const [vueCode, setVueCode] = useState<string>(() => transformCode(defaultCode) || '');
  const [error, setError] = useState(null);
  // const webWorker = useWebWorker<string>(WorkerModule);

  const handleCodeTransform = () => {
    try {
      const transformedCode = transformCode(reactCode);

      if (transformedCode !== null) {
        setVueCode(transformedCode);
      }
    } catch(error) {
      setError(error);
    }
  }

  return (
    <div className="App">
      <SplitEditor
        mode="javascript"
        splits={2}
        theme="textmate"
        fontSize={14}
        value={[reactCode, vueCode]}
        onChange={([reactCode]: any) => {
          setReactCode(reactCode);
          handleCodeTransform();
        }}
        style={{ width: '80vw', height: '80vh', margin: '50px auto' }}
        enableBasicAutocompletion      
      />
      <button onClick={handleCodeTransform}>
        Transform code
      </button>
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
