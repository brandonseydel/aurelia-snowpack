

const aureliaPlugin = require('@aurelia/plugin-conventions');
const fs = require("fs");
var path = require('path');
const typescript = require("typescript");
const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', { encoding: "utf-8" }));

exports.build = function build(fileLoc) {
    const fileSource = fs.readFileSync(fileLoc, { encoding: "utf-8" });
    if (!fileSource) { return { result: '' }; }
    const result = aureliaPlugin.preprocess(
        { path: fileLoc, contents: fileSource },
        aureliaPlugin.preprocessOptions({})
    );

    let sf = typescript.createSourceFile(fileLoc, result.code);
    sf.statements.forEach(replaceTarget => {
        const isImport = typescript.isImportDeclaration(replaceTarget);
        if (isImport) {
            const text = replaceTarget.getFullText(sf);
            const htmlFilePAth = text.match(/['|"](.*html)['|"]/);
            if (htmlFilePAth && htmlFilePAth.length > 1) {
                const relativePath = path.resolve(path.dirname(fileLoc), htmlFilePAth[1]);
                let data = fs.readFileSync(relativePath, { encoding: "utf-8" });
                const start = replaceTarget.getStart(sf);
                const end = replaceTarget.getEnd(sf);
                const newStatement = `let __au2ViewDef = \`${data.replace(/\$\{/g, '\\${')}\`;`;
                const oldText = sf.text;
                const pre = oldText.substring(0, start);
                const post = oldText.substring(end);
                const newText = pre + newStatement + post;
                sf = sf.update(
                    newText,
                    {
                        span: {
                            start: start,
                            length: end - start,
                        },
                        newLength: newStatement.length
                    })

            }
        }
    });
    return {        
        result: typescript.transpileModule(sf.getFullText().replace(/@customElement\(__au2ViewDef\)/g, '@customElement({template: __au2ViewDef} )'), tsconfig).outputText
    };
};