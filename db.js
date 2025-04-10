function(C, A) {
  let L = #fs.qst.lib();

  if (!#G.cache) {
    #G.cache = {};
  }

  let DB = {
    __get(id) {
      return L.R.rslt.try_wrapper(() => L.R.optn.try_wrapper(() => {
        // fetch the doc if it is uncached
        if (!(id in #G.cache)) {
          let res = L.R.rslt.catch_into_result(() => #db.f({ _id: id })).try();
          #G.cache[id] = res.first();
        }

        // return the doc or none if it is null
        if (#G.cache[id] === null) {
          return L.R.rslt.ok(L.R.optn.none());
        }
        return L.R.rslt.ok(L.R.optn.some(#G.cache[id]));
      }));
    },

    __store(id, doc) {
      return L.R.rslt.try_wrapper(() => {
        // reject update query for caching
        if (Object.keys(doc).some(k => k.startsWith("$"))) {
          return L.R.rslt.err(L.R.custom_err("QstDbUpdateForbidden", "Update queries are not permitted here (yet)", { query: doc }));
        }

        let res = L.R.rslt.catch_into_result(() => #db.us({ _id: id }, doc)).try();
        res = res[0]; // get the first upsert result as there is only one

        // account for update result having an ok == false (which probably never happens)
        if (!res.ok) {
          return L.R.rslt.err(L.R.custom_err("QstDbOperationFailed", "Db operation failed for unknown reasons", { response: res }));
        }

        // cache the result
        #G.cache[id] = doc;
        return L.R.rslt.ok();
      });
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
