function createParams(): {[key: string]: string} {
  let params = Object.assign({}, ...location
    .hash
    .substr(1)
    .split('&')
    .filter(it=>it)
    .map(it=>it.split('='))
    .map(it=>({[it[0]]: decodeURIComponent(it[1])})));

  return new Proxy(params, {
    set: (target, prop, value) => {
      let val = Reflect.set(target, prop, value);
      location.hash = Object
        .keys(params)
        .map(it=>`${it}=${encodeURIComponent(params[it])}`)
        .join('&');
      return val;
    },
    defineProperty: (target, prop, attr) => {
      let val = Reflect.defineProperty(target, prop, attr);
      location.hash = Object
        .keys(params)
        .map(it=>`${it}=${encodeURIComponent(params[it])}`)
        .join('&');
      return val;
    },
    deleteProperty: (target, prop) => {
      let val = Reflect.deleteProperty(target, prop);
      location.hash = Object
        .keys(params)
        .map(it=>`${it}=${encodeURIComponent(params[it])}`)
        .join('&');
      return val;
    }
  });
}

const MANAGER = createParams();

export default MANAGER;
