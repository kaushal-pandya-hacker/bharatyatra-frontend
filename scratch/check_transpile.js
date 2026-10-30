const ts = require('typescript');
const code = 'import destinationsMasterRaw from "@/data/tourism/destinations-master.json"; console.log(destinationsMasterRaw);';
const transpiled = ts.transpileModule(code, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
});
console.log('Transpiled code:\n' + transpiled.outputText);
