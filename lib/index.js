'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// https://gist.github.com/Xeoncross/7663273
function ajax(url, callback, data) {
  if (data) {
    var reqOptions = typeof url === 'string' ? { uri: url, body: data, json: true } : _extends({}, url, { body: data, json: true });
    _request2.default.post(reqOptions, function (err, res, body) {
      if (err) console.log(err);
      callback(err, body, res);
    });
  } else {
    (0, _request2.default)(url, function (err, res, body) {
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

var locizeActions = {
  init: function init(options) {

    this.options = _extends({}, getDefaults(), this.options, options);

    this.submitting = null;
    this.pending = {};
    this.done = {};

    this.submit = utils.debounce(this.submit, this.options.debounceSubmit);
  },

  actions: function actions(action, ns, key, value, parser) {
    var _this = this;

    if (typeof value == 'function') {
      parser = value;
      value = true;
    }
    ['pending', 'done'].forEach(function (k) {
      if (_this.done[ns] && _this.done[ns][key]) return;
      if (!_this[k][ns]) _this[k][ns] = {};
      _this[k][ns][key] = value;
    });
    this.submit(action, parser);
  },

  submit: function submit(action, parser) {
    var _this2 = this;

    if (this.submitting) return this.submit(action, parser);

    parser = parser || function (obj) {
      if (action === 'used') {
        return Object.keys(obj);
      }
      return obj;
    };
    // missing options
    var isMissing = utils.isMissingOption(this.options, ['projectId', 'version', 'apiKey', 'referenceLng']);
    if (isMissing) return this.submit();

    this.submitting = this.pending;
    this.pending = {};

    var namespaces = Object.keys(this.submitting);

    var todo = namespaces.length;
    var doneOne = function doneOne() {
      todo--;

      if (!todo) {
        _this2.submitting = null;
      }
    };
    namespaces.forEach(function (ns) {
      var keys = parser(_this2.submitting[ns]);
      var url = utils.replaceIn(_this2.options.actionPath, ['projectId', 'version', 'lng', 'ns', 'action'], _extends({}, _this2.options, { lng: _this2.options.referenceLng, ns: ns, action: action }));

      var reqOptions = {
        uri: url,
        headers: {
          'Authorization': _this2.options.apiKey
        }
      };

      if (!utils.isEmptyObj(keys)) {
        ajax(reqOptions, function () {
          doneOne();
        }, keys);
      } else {
        doneOne();
      }
    });
  }
};

locizeActions.type = '3rdParty';

exports.default = locizeActions;