import { render } from 'react-dom';
import App from './App';
import '@adyen/adyen-web/dist/adyen.css';
import './styles.css';

// import { inspect } from '@xstate/inspect';
// // https://xstate.js.org/docs/packages/xstate-inspect

// if (typeof window !== 'undefined') {
//   inspect({
//     iframe: false,
//   });
// }

const rootElement = document.getElementById('root');

render(<App />, rootElement);
