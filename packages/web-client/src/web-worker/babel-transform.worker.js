/* eslint-disable */
// import * as babel from '@babel/core';
// const babel = self.importScripts('@babel/core')
// self.transform = require('@babel/core').transform;
import babel from '@babel/core';

const bootstrap = () => {
  self.onmessage = (event) => {
    console.log('WORKER [event]', event)
    console.log({ data: event.data });

    // const result = self.transform(event.data);
    // return result;
  }
  
  self.onerror = (event) => {
    console.log('WORKER [error]', { event });
  }

  return self;
}

bootstrap();

export default self