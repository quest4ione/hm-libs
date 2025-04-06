function(C, A) {
  let L = #fs.qst.lib();

  if (!#G.cache) {
    #G.cache = {};
  }

  let DB = {
    __get(id) {
      if (!(id in #G.cache)) {
        let res = L.R.rslt.try(() => #db.f({_id: id}));
        if (!res.ok) {
          return res;
        }
        #G.cache[id] = res.unwrap().first();
      }

      if (#G.cache[id] === null) {
        return L.R.rslt.ok(L.R.optn.none());
      }
      return L.R.rslt.ok(L.R.optn.some(#G.cache[id]));
    },
  };

  if (C.calling_script) {
    if (C.calling_script.split(".")[0] != C.this_script.split(".")[0]) {
      return L.F.res({ status: 403, msg: "nope." });
    }
  } else if (C.caller != C.this_script.split(".")[0] || C.is_scriptor) {
    return L.F.res({ status: 403, msg: "not happening" });
  }

  return DB;
}
