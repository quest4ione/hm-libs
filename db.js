function(C, A) {
  let L = #fs.qst.lib();

  if (!#G.cache) {
    #G.cache = {};
  }

  let DB = {
    __get(id) {
      if (!(id in #G.cache)) {
        let res = L.R.rslt.catch_into_result(() => #db.f({_id: id}));
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

    __store(id, doc) {
      // reject update query
      if (Object.keys(doc).some(k => k.startsWith("$"))) {
        return L.R.rslt.err(L.R.custom_err("QstDbUpdateForbidden", "Update queries are not permitted here", {query: doc}));
      }

      let res = L.R.rslt.catch_into_result(() => #db.us({_id: id}, doc));
      if (!res.ok) {
        return res;
      }
      res = res.unwrap()[0];
      // account for update result having an ok == false (which probably never happens)
      if (!res.ok) {
        return L.R.rslt.err(L.R.custom_err("QstDbOperationFailed", "Db operation failed for unknown reasons", {response: res}));
      }
      #G.cache[id] = doc;
      return L.R.rslt.ok();
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
