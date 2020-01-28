import React from 'react';
import logo from './logo.svg';
import './App.css';
import { split } from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-textmate';
import { DiffViewer } from './components/DiffViewer';
import css from './components/App.module.css';
import vueLogo from './assets/images/vue-logo.svg';
import { SplitEditor as CustomSplitEditor } from './components/SplitEditor';
import { useModal } from './hooks/use-modal';
import { useReactToVue } from './hooks/use-react-to-vue';
import { hookExamples } from './examples';
import { MonacoSplitEditor } from '../src/components/MonacoSplitEditor';

const SplitEditor = split as any;

const ReactLogo = <img src={logo} alt="React.js logo" className={css.react_logo} />;
const VueLogo = <img src={vueLogo} alt="Vue.js logo" className={css.vue_logo} />;

export function App() {
  const reactToVueContext = useReactToVue();
  const {
    reactCode,
    setReactCode,
    reactError,
    vueCode,
  } = reactToVueContext;
  const { Modal, ...modalContext } = useModal();

  return (
    <div className="App">
      <p>Transform React.js Hooks to Vue.js Composition Api</p>
      {hookExamples.map(example => (
        <button
          key={example.name}
          onClick={() => setReactCode(example.code)}
        >
          {example.name}
        </button>
      ))}
      <MonacoSplitEditor
        editors={[
          {
            value: reactCode,
            onChange: setReactCode,
            error: reactError,
            header: ReactLogo
          },
          {
            value: vueCode,
            options: { readOnly: true } as any,
            header: VueLogo,
          }
        ]}
      />
      <CustomSplitEditor {...reactToVueContext} />
      <SplitEditor
        mode="javascript"
        splits={2}
        theme="textmate"
        fontSize={14}
        value={[reactCode, vueCode]}
        onChange={([reactCode]: [string, string]) => {
          setReactCode(reactCode);
        }}
        style={{ width: '80vw', height: '80vh', margin: '0 auto' }}
        enableBasicAutocompletion
      />
      {reactError && (
        <>
          <h2>Error</h2>
          <p>{reactError.message}</p>
        </>
      )}
      <button onClick={modalContext.open}>
        Show differences
      </button>
      <Modal>
        <DiffViewer
          oldValue={reactCode}
          newValue={vueCode}
        />
      </Modal>
    </div>
  );
}
