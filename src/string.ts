export {}

type sdict = {[key: string]: string};

declare global {
  interface String {
    format: (fmt: string[] | sdict) => string
  }
}

String.prototype.format = function(fmt: string[] | sdict) {
  let cnt = 0;
  return this.replace(
    /{([a-zA-Z0-9_]*)(:[^}]*)?}/g,
    function(_: string, g1: string | undefined, g2: string | undefined) {
      let r: string | undefined;
      if(g1) {
        if(!(r = (fmt as sdict)[g1])) {
          throw `KeyError: ${g1}`;
        }
        return r;
      }
      if(!(r = (fmt as string[])[cnt++])) {
        throw `Index out of range: ${cnt-1}`;
      }
      return r;
    })
}
