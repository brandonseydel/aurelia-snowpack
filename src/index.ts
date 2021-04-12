import { MyApp } from './my-app';
import { Aurelia, CustomElement } from 'aurelia';

let aurelia = Aurelia.app(MyApp);
let container = aurelia.container;
aurelia.start();

// HMR Code Snippet Example
if (import.meta.hot) {
  import.meta.hot.accept(() => {
  });
  import.meta.hot.dispose(() => {
    aurelia.root.deactivate();
  });
}