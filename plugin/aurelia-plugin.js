const defaultOptions = {
    "compilerOptions": {
        "module": "esnext",
        "target": "esnext",
        "moduleResolution": "node",
        "jsx": "preserve",
        "baseUrl": "./",
        "noEmit": true,
        "strict": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "allowSyntheticDefaultImports": true,
        "importsNotUsedAsValues": "error"
    }
};

const aureliaPlugin = require('@aurelia/plugin-conventions');
const fs = require("fs");
var path = require('path');
const typescript = require("typescript");

module.exports = function (snowpackConfig, { tsconfig }) {
    return {
        name: 'aurelia-plugin',
        resolve: {
            input: ['.ts'],
            output: ['.js'],
        },
        async load({ filePath }) {
            const { sourcemap, sourceMaps } = snowpackConfig.buildOptions;
            const generateSourceMaps = sourcemap || sourceMaps;

            const fileSource = fs.readFileSync(filePath, { encoding: "utf-8" });
            if (!fileSource) { return { result: '' }; }



            const result = aureliaPlugin.preprocess(
                { path: filePath, contents: fileSource },
                aureliaPlugin.preprocessOptions({})
            );

            let sf = typescript.createSourceFile(filePath, result.code);
            sf.statements.forEach(replaceTarget => {
                const isImport = typescript.isImportDeclaration(replaceTarget);
                if (isImport) {
                    const text = replaceTarget.getFullText(sf);
                    const htmlFilePAth = text.match(/['|"](.*html)['|"]/);
                    if (htmlFilePAth && htmlFilePAth.length > 1) {
                        const relativePath = path.resolve(path.dirname(filePath), htmlFilePAth[1]);
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

            const configuration = tsconfig ?? defaultOptions;
            configuration.compilerOptions.inlineSourceMap = true;
            const transpileModule = typescript.transpileModule(sf.getFullText().replace(/@customElement\(__au2ViewDef\)/g, '@customElement({template: __au2ViewDef} )'), configuration);
            const code = transpileModule.outputText;
            const matchedSourceMapStrings = code.match(/sourceMappingURL=data:application\/json;base64,(.*)/);

            console.log(transpileModule.outputText);
            return {
                '.js': { code: transpileModule.outputText, map: matchedSourceMapStrings ? matchedSourceMapStrings[0] : undefined },
            };
        }
    }
};