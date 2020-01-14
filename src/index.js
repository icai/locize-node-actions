import * as utils from './utils';
import request from 'request';

// https://gist.github.com/Xeoncross/7663273
function ajax(url, callback, data) {
  if (data) {
    let reqOptions = typeof url === 'string' ? { uri: url, body: data, json: true } : { ...url, ...{ body: data, json: true }};
    request.post(reqOptions, function(err, res, body) {
      if (err) console.log(err);
      callback(err, body, res);
    });
  } else {
    request(url, function(err, res, body) {
      if (err) console.log(err);
      callback(err, body, res);
    });
  }
};

function getDefaults() {
  return {
    actionPath: 'https://api.locize.app/{{action}}/{{projectId}}/{{version}}/{{lng}}/{{ns}}',
    referenceLng: 'en',
    version: 'latest',
    debounceSubmit: 90000
  };
}

const locizeActions = {
  init: function(options) {

    this.options =  { ...getDefaults(), ...this.options, ...options };

    this.submitting = null;
    this.pending = {};
    this.done = {};

    this.submit = utils.debounce(this.submit, this.options.debounceSubmit);

  },

  actions: function(action, ns, key, value, parser) {
    if (typeof value == 'function') {
      parser = value;
      value = true
    }
    ['pending', 'done'].forEach((k) => {
      if (this.done[ns] && this.done[ns][key]) return;
      if (!this[k][ns]) this[k][ns] = {};
      this[k][ns][key] = value;
    });
    this.submit(action, parser);
  },

  submit: function(action, parser) {
    if (this.submitting) return this.submit(action, parser);

    parser = parser || function(obj) {
      if(action === 'used') {
        return Object.keys(obj)
      }
      return obj
    }
    // missing options
    const isMissing = utils.isMissingOption(this.options, ['projectId', 'version', 'apiKey', 'referenceLng'])
    if (isMissing) return this.submit();

    this.submitting = this.pending;
    this.pending = {};

    const namespaces = Object.keys(this.submitting);

    let todo = namespaces.length;
    const doneOne = () => {
      todo--;

      if (!todo) {
        this.submitting = null;
      }
    }
    namespaces.forEach((ns) => {
      const keys = parser(this.submitting[ns]);
      let url = utils.replaceIn(this.options.actionPath, ['projectId', 'version', 'lng', 'ns', 'action'], { ...this.options, lng: this.options.referenceLng, ns, action });

      const reqOptions = {
        uri: url,
        headers: {
          'Authorization': this.options.apiKey
        }
      };

      if (!utils.isEmptyObj(keys)) {
        ajax(reqOptions, () => { doneOne(); }, keys);
      } else {
        doneOne();
      }
    });
  }
}

locizeActions.type = '3rdParty';

export default locizeActions;
