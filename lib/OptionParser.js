var assert = require('assert');

module.exports = function parseAndValidateOptions(params, schema, displayName) {
  // ensure required parameters are passed in
  Object.keys(schema)
    .filter(function(key) { return schema[key].isRequired })
    .forEach(function(key) {
      assert(params.hasOwnProperty(key),
        format("Missing required parameter '" + key + "'")
      );
    })
  ;

  return Object.keys(params).reduce(function(hsh, key) {
    var spec = schema[key];
    var value = params[key];
    var validationError;

    assert(schema.hasOwnProperty(key),
      format("Unrecognized option '" + key + "'")
    );

    if (spec.validate) {
      validationError = spec.validate(value);

      assert(!validationError, format(validationError));
    }

    if (spec.type) {
      assert(typeof value === spec.type,
        format("Option '" + key + "' must be of type '" + spec.type + "' not '" + typeof value + "'.")
      );
    }

    if (spec.default && (value === undefined || value === null)) {
      hsh[key] = spec.default;
    }
    else {
      hsh[key] = value;
    }

    return hsh;
  }, getDefaults());

  function getDefaults() {
    return Object.keys(schema).reduce(function(hsh, key) {
      if (schema[key].default) {
        hsh[key] = schema[key].default;
      }

      return hsh;
    }, {});
  }

  function format(message) {
    return "HappyPack[" + displayName + "]: " + message;
  }
};