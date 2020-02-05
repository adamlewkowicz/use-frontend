import React, { Suspense, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import css from './components/App.module.css';
import vueLogo from './assets/images/vue-logo.svg';
import { useModal } from './hooks/use-modal';
import { useReactToVue } from './hooks/use-react-to-vue';
import { hookExamples, defaultExample } from './examples';
import { MonacoSplitEditor } from '../src/components/MonacoSplitEditor';
import { prettierFormat, reactLazyNamed } from './utils';
import { Select, MenuItem, makeStyles, InputLabel, FormControl } from '@material-ui/core';

const DiffEditor = reactLazyNamed(
  () => import('@monaco-editor/react'),
  'DiffEditor'
);

const ReactLogo = <img src={logo} alt="React.js logo" className={css.react_logo} />;
const VueLogo = <img src={vueLogo} alt="Vue.js logo" className={css.vue_logo} />;

const useStyles = makeStyles(theme => ({
  select: {
    background: '#fff',
    '&$focused': {
      color:'#000000'
    }
  }
}));

export function App() {
  const reactToVueContext = useReactToVue();
  const {
    reactCode,
    setReactCode,
    reactError,
    vueCode,
  } = reactToVueContext;
  const { Modal, ...modalContext } = useModal();
  const [activeExample, setActiveExample] = useState<string>(defaultExample.name);
  const styles = useStyles();

  const handleSelectOnChange: any = (event: React.ChangeEvent<{ value: string }>) => {
    const exampleName = event.target.value;
    const foundExample = hookExamples.find(example => example.name === exampleName);

    setActiveExample(exampleName);

    if (foundExample) {
      setReactCode(prettierFormat(foundExample.code));
    }
  }

  return (
    <div className="App">
      <h1>Use-frontend</h1>
      <p>Transform React.js Hooks to Vue.js Composition Api</p>
      <FormControl variant="filled">
        <InputLabel>Example</InputLabel>
        <Select
          
          value={activeExample}
          onChange={handleSelectOnChange}
          className={styles.select}
        >
          {hookExamples.map(example => (
            <MenuItem
              key={example.name}
              value={example.name}
            >
              {example.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className={css.content}>
        <MonacoSplitEditor
          editors={[
            {
              value: reactCode,
              onChange: setReactCode,
              error: reactError,
              header: (
                <>
                  {ReactLogo}
                  <p className={css.desc}>React.js - Hooks</p>
                </>
              )
            },
            {
              value: vueCode,
              options: { readOnly: true } as any,
              header: (
                <>
                  {VueLogo}
                  <p className={css.desc}>Vue.js - Composition Api</p>
                </>
              )
            }
          ]}
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
      </div>
      <Suspense fallback="Loading">
        <Modal>
          <DiffEditor
            original={reactCode}
            modified={vueCode}
            language="javascript"
            height="500px"
          />
        </Modal>
      </Suspense>
    </div>
  );
}
