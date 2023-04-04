import rc from 'rc';
const prefix = 'pow';

function translate (key, obj) {
  if (!key.startsWith(`${prefix}_`)) return;

  let cursor = obj;
  const keys = key.substring(prefix.length + 1).split('__');
  const length = keys.length - 1;

  for (let i = 0; i < length; ++i) {
    const key = keys[i];
    if (!cursor[key]) {
      return false;
    }

    cursor = cursor[key];
  }

  if (typeof cursor === 'object') {
    const lastKey = keys.pop();
    cursor[lastKey] = Object.values(cursor[lastKey]);
  }

  return true;
}

const config = rc(prefix, {
  server: {
    cors: {}
  },
  pow: {
    // interval for adjusting the level
    levelInt: 130,
    // size of a measurement bucket
    stepInt: 2500,
    // only even multiples of the stepInterval
    seconds: 5 * 2,
    // currently only 3 layers of levels
    levels: [50000, 3000000, 10000000],
    // default time is 30 seconds for a pow max solving time
    ttl: 1000 * 30,
    // max concurrent pow configs that are allowed
    // everything that comes past this deletes from the front
    max: 100000
  },
  token: {
    // max time until backend needs to check the token
    // by default 15 seconds
    ttl: 1000 * 15,
    // max concurrent tokens that are allowed
    // everything that comes past this deletes from the front
    max: 100000
  },
  clients: {
    // test123: {
    //   secret: '123456'
    // }
  }
});

if (config.translate) {
  if (typeof config.translate === 'string') {
    translate(config.translate, config);
  } else if (typeof config.translate === 'object') {
    Object.values(config.translate).forEach((value) =>
      translate(value, config)
    );
  }
}
export default config;
