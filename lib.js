function(C, A) {
  let L = { // the LIB
    F: { // the CLI FORMATTING
      sts: code => { // http status msg
        throw new Error("TODO");
      },
    },
    P: { // the PARSING (dun-dunnn)
      qne: (quine, label, parser=x => x) => { // trims and concats comments starting with label char (e.g. //! or //@) and returns the (parsered) result
        let clean = "";
        for (let line of quine.split("\n")) {
          let r = RegExp(`\s*\\/\\/#\\s*(.*)\\s*`).exec(line); // extra \ cause of pattern string into regex
          if (!r) {
            continue;
          }
          clean += r[1] + "\n";
        }
        return parser(clean);
      },
      json: text => JSON.parse(text), // might upgrade later (keys without quotes, trailing commas)
    }
  };

  if (C.caller != "qst" || (C.calling_script && C.calling_script.split(".")[0] != "qst")) {
    return "- temp msg | unauthorized (qst only) -";
  }

  return L;
}
