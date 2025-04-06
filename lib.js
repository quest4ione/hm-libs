function(C, A) {
  //@ {
  //@   status: {
  //@     100: "Continue",
  //@     101: "Switching Protocols",
  //@     102: "Processing",
  //@     103: "Early Hints",
  //@     
  //@     200: "OK",
  //@     201: "Created",
  //@     202: "Accepted",
  //@     203: "Non-Authoritative Information",
  //@     204: "No Content",
  //@     205: "Reset Content",
  //@     206: "Partial Content",
  //@     207: "Multi-Status",
  //@     208: "Already Reported",
  //@     226: "IM Used",
  //@     
  //@     300: "Multiple Choices",
  //@     301: "Moved Permanently",
  //@     302: "Found",
  //@     303: "See Other",
  //@     304: "Not Modified",
  //@     305: "Use Proxy",
  //@     307: "Temporary Redirect",
  //@     308: "Permanent Redirect",
  //@     
  //@     400: "Bad Request",
  //@     401: "Unauthorized",
  //@     402: "Payment Required",
  //@     403: "Forbidden",
  //@     404: "Not Found",
  //@     405: "Method Not Allowed",
  //@     406: "Not Acceptable",
  //@     407: "Proxy Authentication Required",
  //@     408: "Request Timeout",
  //@     409: "Conflict",
  //@     410: "Gone",
  //@     411: "Length Required",
  //@     412: "Precondition Failed",
  //@     413: "Content Too Large",
  //@     414: "URI Too Long",
  //@     415: "Unsupported Media Type",
  //@     416: "Range Not Satisfiable",
  //@     417: "Expectation Failed",
  //@     418: "I'm a teapot",
  //@     421: "Misdirected Request",
  //@     422: "Unprocessable Content",
  //@     423: "Locked",
  //@     424: "Failed Dependency",
  //@     425: "Too Early",
  //@     426: "Upgrade Required",
  //@     428: "Precondition Required",
  //@     429: "Too Many Requests",
  //@     431: "Request Header Fields Too Large",
  //@     451: "Unavailable For Legal Reasons",
  //@     
  //@     500: "Internal Server Error",
  //@     501: "Not Implemented",
  //@     502: "Bad Gateway",
  //@     503: "Service Unavailable",
  //@     504: "Gateway Timeout",
  //@     505: "HTTP Version Not Supported",
  //@     506: "Variant Also Negotiates",
  //@     507: "Insufficient Storage",
  //@     508: "Loop Detected",
  //@     510: "Not Extended",
  //@     511: "Network Authentication Required",
  //@   },
  //@ }

  let D;

  let L = { // the LIB
    F: { // the HUMAN-READABLE FORMATTING
      sts(code) { // http status msg
        if (code in L.D.status) {
          return L.R.optn.some(L.D.status[code]);
        }
        return L.R.optn.none();
      },
      res(val) {
        val = L.P.res(val);

        let out = [];
        let s_clr;
        if (val.status >= 500) {
          s_clr = "D";
        } else if (val.status >= 400) {
          s_clr = "F";
        } else if (val.status >= 300) {
          s_clr = "J";
        } else if (val.status >= 200) {
          s_clr = "L";
        } else {
          s_clr = "B";
        }

        let s_msg = L.F.sts(val.status).unwrap_or("<no status message found>");
        out.push(`\`${s_clr}${val.status} ${s_msg}\``);
        out.push(val.msg);
        return out.join("\n");
      },
      panic(type, msg, detail = {}) {
        throw L.R._safe_err(type, msg, detail)
      },
    },


    P: { // the PARSING (dun-dunnn)
      qne(I, label, parser = x => x) { // trims and concats comments starting with label char (e.g. //! or //@) and returns the (parsered) result
        let O = "";
        for (let line of I.split("\n")) {
          let r = new RegExp(`^\\s*\\/\\/${label}\\s*(.*)\\s*`, "m").exec(line); // extra \ cause of pattern string into regex
          if (!r) {
            continue;
          }
          O += r[1] + "\n";
        }
        return parser(O);
      },

      json(I) {
        I = I.replaceAll(/,(\s*[}\]])/g, "$1") // remove trailing commas
          .replaceAll(/([a-z0-9_]+[^"]):/g, "\"$1\":"); // add quotes to unquoted keys (TODO is gonna break inside string values)
        return JSON.parse(I);
      },

      res(val) {return val}, // TODO
      dco(fn) {
        let O = [];
        let done = false;
        let A = true;

        while (!done) {
          done = true;
          let last = fn.call();
          if (!Array.isArray(last)) {
            A = false;
            last = [last];
          }
          for (let [i, p] of last.entries()) {
            p = p.replaceAll(/(?:(`)[a-zA-Z0-9])?[¡¢Á¤Ã¦§¨©ª]\1/g, "§");
            if (!O[i]) {
              O[i] = p;
              done = false;
              continue;
            }

            for (let j = 0; j < p.length; j++) {
              if (O[i][j] == "§") {
                done = false;
                O[i] = O[i].slice(0, j) + p[j] + O[i].slice(j+1);
              }
            }
          }
        }

        if (!A) {
          O = O[0];
        }
        return O;
      },
    },


    R: { // the COMPUTER-READABLE FORMATTING
      optn: {
        _optn(value) {
          let O = {
            ok: value !== undefined,
            unwrap: () => {
              if (O.ok) {
                return value;
              }
              L.F.panic("QstLibNoneUnwrap", "Unwrap on none option");
            },
            unwrap_or: or => {
              if (O.ok) {
                return value;
              }
              return or;
            },
          };
          return O;
        },
        some(value) {return L.R.optn._optn(value)},
        none() {return L.R.optn._optn()},
      },

      rslt: {
        _rslt(value) {
          let O = {
            ok: !(value instanceof Error),
            unwrap: () => {
              if (O.ok) {
                return value;
              }
              L.F.panic("QstLibErrUnwrap", "Unwrap on error result");
            },
            unwrap_or: or => {
              if (O.ok) {
                return value;
              }
              return or;
            },
          };
          return O;
        },
        ok(value) {return L.R.rslt._rslt(value)},
        err(type, msg, detail = {}) {return L.R.rslt._rslt(L.R._safe_err(type, msg, detail))},
      },

      _safe_err(type, msg, detail = {}) {
        let e = new Error(msg);
        let s = `${type}: ${msg}\n`;

        // opsec-ify stack
        for (let l of e.stack.split("\n")) {
          if (l.includes(C.this_script)) {
            continue;
          }
          s += `${l}\n`;
        }

        // cause of read-only shenanigans
        Object.defineProperties(e, {
          name: { value: type, enumerable: true },
          stack: { value: s },
          detail: { value: detail }
        });
        return e;
      },
    },
    DB: {
      f(...a) {return #db.f(...a)},
      i(...a) {return #db.i(...a)},
      u(...a) {return #db.u(...a)},
      us(...a) {return #db.us(...a)},
      u1(...a) {return #db.u1(...a)},
      r(...a) {return #db.r(...a)},
    },
  };


  D = L.P.qne(#fs.scripts.quine(), "@", L.P.json);
  L.D = D;


  if (C.caller != "qst" || (C.calling_script && C.calling_script.split(".")[0] != "qst")) {
    return L.F.res({ status: 403, msg: "If only it would be that easy" });
  }

  return DEEP_FREEZE(L);
}
