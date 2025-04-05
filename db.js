function(C, A) {
  let L = #fs.qst.lib();

  let DB = {};

  if (C.calling_script) {
    if (C.calling_script.split(".")[0] != C.this_script.split(".")[0]) {
      return L.F.res({ status: 403, msg: "nope." });
    }
  } else if (C.caller != C.this_script.split(".")[0] || C.is_scriptor) {
    return L.F.res({ status: 403, msg: "not happening" });
  }

  return DB;
}
