
interface String {
  format(fmt: string[] | {[key: string]: string}): string
}

String.prototype.format = function(fmt: string[] | {[key: string]: string}) {
  let cnt = 0;
  return this.replace(
    /{([a-zA-Z0-9_]*)(:[^}]*)?}/g,
    function(_: string, g1: string | undefined, g2: string | undefined) {
      let r: string | undefined;
      if(g1) {
        if(!(r = fmt[g1])) {
          throw `KeyError: ${g1}`;
        }
        return r;
      }
      if(!(r = fmt[cnt++])) {
        throw `Index out of range: ${cnt-1}`;
      }
      return r;
    })
}
