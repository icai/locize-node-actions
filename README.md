[![Travis](https://img.shields.io/travis/icai/locize-node-actions/master.svg?style=flat-square)](https://travis-ci.org/icai/locize-node-actions)
[![npm version](https://img.shields.io/npm/v/@w3cub/locize-node-actions.svg?style=flat-square)](https://www.npmjs.com/package/@w3cub/locize-node-actions)
[![David](https://img.shields.io/david/icai/locize-node-actions.svg?style=flat-square)](https://david-dm.org/icai/locize-node-actions)

This is a standalone scriot to be used for [locize](http://locize.com) api service. 

# Getting started

Source can be loaded via [npm](https://www.npmjs.com/package/@w3cub/locize-node-actions) 

```
# npm package
$ npm install @w3cub/locize-node-actions
```

## Options

```js
{
  // the id of your locize project
  projectId: '[PROJECTID]',

  // add an api key if you want to send missing keys
  apiKey: '[APIKEY]',

  // the reference language of your project
  referenceLng: '[LNG]',

  // version - defaults to latest
  version: '[VERSION]',

  // debounce interval to send data in milliseconds
  debounceSubmit: 90000,

  // action path formatter
  actionPath: 'https://api.locize.app/{{action}}/{{projectId}}/{{version}}/{{lng}}/{{ns}}',

}
```



Directly call locizeactions.init:

```js
import locizeactions from "locize-node-actions";

locizeactions.init(options);
```

then call used function with namespace and key:

```js
import locizeactions from "locize-node-actions";

locizeActions.actions('action', "myNamespace", "myKey.as.in.locize", "myKey.as.the.value", (obj)=> {
  // parse function 
  // for missing action
  return Object.keys(obj)
  // 
});
```
