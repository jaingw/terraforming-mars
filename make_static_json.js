require("dotenv").config()
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

function getAllTranslations() {
    const pathToTranslationsDir = path.resolve("src/locales")
    const translations = {};
    let translationDir = "";

    const dirs = fs.readdirSync(pathToTranslationsDir);
    for (const idx in dirs) {
        const lang = dirs[idx];
        const localeDir = path.join(pathToTranslationsDir, lang);
        if (lang.length === 2 && fs.statSync(localeDir).isDirectory()) {
            translationDir = path.resolve(path.join(pathToTranslationsDir, lang));

            const files = fs.readdirSync(translationDir);
            for (const idx in files) {
                const file = files[idx];

                if ( file === undefined || ! file.endsWith(".json")) continue;

                const dataJson = JSON.parse(fs.readFileSync(path.join(translationDir, file),"utf8"));

                for (const phrase in dataJson) {
                    if (translations[phrase] === undefined) {
                        translations[phrase] = {};
                    }
                    translations[phrase][lang] = dataJson[phrase];
                }
            }
        }
    }

    return translations;
}


function generateAppVersion() {
    // assumes SOURCE_VERSION is git hash
    if (process.env.SOURCE_VERSION) {
        return process.env.SOURCE_VERSION.substring(0, 7) + " deployed " + new Date(new Date().getTime()+8*60*60*1000).toISOString().slice(0,16).replace("T"," ");
    }
    try {
        return child_process.execSync("git log -1 --pretty=format:\"%h %cD\"").toString();
    } catch (error) {
        console.warn("unable to generate app version", error);
        return "unknown version";
    }
}

function getWaitingForTimeout() {
    if (process.env.WAITING_FOR_TIMEOUT) {
        return Number(process.env.WAITING_FOR_TIMEOUT);
    }
    return 5000;
}


function _translationsCompare(translationsJSON) {
    const pathToTranslationsDir = path.resolve("src/locales")
    const translations = {};
    let translationDir = "";
    const cntranslation = translationsJSON;
    const dirs = fs.readdirSync(pathToTranslationsDir);
    for (const idx in dirs) {
        const lang = dirs[idx];
        if(lang === "cn"){
            continue;
        }
        const localeDir = path.join(pathToTranslationsDir, lang);
        if (lang.length === 2 && fs.statSync(localeDir).isDirectory()) {
            translations[lang] = {};

            translationDir = path.resolve(path.join(pathToTranslationsDir, lang));

            const files = fs.readdirSync(translationDir);
            for (const idx in files) {
                const file = files[idx];

                if ( file === undefined || ! file.endsWith(".json")) continue;

                const dataJson = JSON.parse(fs.readFileSync(path.join(translationDir, file),"utf8"));
                console.log(path.join(translationDir, file));
                for (const k in dataJson) {
                     if(cntranslation[k]["cn"] === undefined){
                         console.log(k);
                     }
                }
            }
        }
    }

}
const translationsJSON = getAllTranslations();
// translationsCompare(translationsJSON);

fs.writeFileSync("assets/settings.json", JSON.stringify({
    version: generateAppVersion(),
    waitingForTimeout: getWaitingForTimeout()
}));

fs.writeFileSync("assets/translations.json", JSON.stringify(
    translationsJSON
));

