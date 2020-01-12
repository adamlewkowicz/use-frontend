import React, { useState, useEffect, useRef } from 'react';
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
import { useBabel } from './hooks/use-babel';
import { default as DiffViewer_ } from 'react-diff-viewer';
import { Modal } from './components/Modal';
import { DiffViewer } from './components/DiffViewer';

const SplitEditor = split  as any;
// var DiffViewer = DiffViewer_ as any;

const defaultCode = `
function useCounter() {
  const [counter, setCounter] = useState(0);
  const [abc, setAbc] = useState({ container: true });

  const doubledCounter = useMemo(() => counter * 2, [counter]);
  
  const increment = () => setCounter(c => c + 1);
  
  return { counter, doubledCounter, increment };
}





function useInputFocus() {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current != null) {
      inputRef.current.focus();
    }
  }, []);

  return inputRef;
}





function useTheme() {
  const theme = useContext(ThemeContext);

  if (theme == null) {
    throw new Error('Theme has not been provided');
  }

  return theme;
}
`.trim();

const babelPlugins = [
  hooksToCompositionPlugin,
];

const storageKey = 'r_code';

export function App() {
  const [reactCode, setReactCode] = useState<string>(() => localStorage.getItem(storageKey) || defaultCode);
  const { transform, error, code: vueCode } = useBabel(babelPlugins);
  const [isShowDiff, setIsShowDiff] = useState<boolean>(false);
  // const webWorker = useWebWorker<string>(WorkerModule);

  useEffect(() => {
    transform(reactCode);
    localStorage.setItem(storageKey, reactCode);
  }, [reactCode, transform]);
  
  return (
    <div className="App">
      <SplitEditor
        mode="javascript"
        splits={2}
        theme="textmate"
        fontSize={14}
        value={[reactCode, vueCode]}
        onChange={([reactCode]: [string, string]) => {
          setReactCode(reactCode);
        }}
        style={{ width: '80vw', height: '80vh', margin: '50px auto' }}
        enableBasicAutocompletion      
      />
      {error && (
        <>
          <h2>Error</h2>
          <p>{error.message}</p>
        </>
      )}
      <button onClick={() => setIsShowDiff(diff => !diff)}>
        Show differences
      </button>
      {isShowDiff && (
        <Modal>
          <DiffViewer
            oldValue={reactCode}
            newValue={vueCode}
          />
        </Modal>
      )}
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
