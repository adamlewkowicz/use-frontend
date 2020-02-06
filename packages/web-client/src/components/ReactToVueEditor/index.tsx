import React from 'react';
import { MonacoSplitEditor } from '../MonacoSplitEditor';
import css from './index.module.css';
import vueLogo from '../../assets/images/vue-logo.svg';
import reactLogo from '../../assets/images/react-logo.svg';
import { UseReactToVueResult } from '../../hooks/use-react-to-vue';

interface ReactToVueEditorProps extends UseReactToVueResult {}

export const ReactToVueEditor = (props: ReactToVueEditorProps) => {
  const {
    reactCode,
    setReactCode,
    reactError,
    vueCode,
  } = props;

  return (
    <MonacoSplitEditor
      editors={[
        {
          value: reactCode,
          onChange: setReactCode,
          error: reactError,
          header: ReactHeader
        },
        {
          value: vueCode,
          options: { readOnly: true } as any,
          header: VueHeader
        }
      ]}
    />
  )
}

const ReactHeader = (
  <>
    <img src={reactLogo} alt="React.js logo" className={css.logo} />
    <p className={css.desc}>React.js - Hooks</p>
  </>
);

const VueHeader = (
  <>
    <img src={vueLogo} alt="Vue.js logo" className={css.logo} />
    <p className={css.desc}>Vue.js - Composition Api</p>
  </>
);