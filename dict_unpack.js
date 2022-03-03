autowatch = 1;
inlets = 1;
outlets = 1;

function process(dname) {
  var d = new Dict(dname);
  var jsob = JSON.parse(d.stringify());
  var final = JSON.stringify(jsob) + "\n";

  final = replaceAll(final, ",", " ");
  final = replaceAll(final, "{", " ");
  final = replaceAll(final, "}", " ");
  final = replaceAll(final, ":", " ");
  final = replaceAll(final, '"', " ");

  post(final);
  outlet(0, final);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}
