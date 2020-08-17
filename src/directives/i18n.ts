
import { PreferencesManager } from "../components/PreferencesManager";

export function translateText(englishText: string): string {
    let translatedText = englishText;
    if ((window as any).TM_translations === undefined) return translatedText; 
    const lang = PreferencesManager.loadValue("lang") || "cn";
    if (lang === "en") return englishText;

    englishText = normalizeText(englishText);
    if(!englishText){
        return translatedText;
    }
    if ((window as any).TM_translations[lang][englishText]) {
        translatedText = (window as any).TM_translations[lang][englishText]
    } else {
        if(englishText.startsWith("(") && englishText.endsWith(")")){
            let stripedText = englishText.slice(1, englishText.length-1);
            stripedText = translateText(stripedText);
            translatedText = "(" + stripedText + ")";
        } else if (englishText && englishText.length > 3) {
            console.log("Please translate \"" + englishText + "\"")
        }
    }
    return translatedText;
}

function normalizeText(text: string): string {
    text = text.replace(/[\n\r]/g, "").replace(/[ ]+/g, " ");
    return text.trim()
}

function translateChildren(node: any) {
    if (node.childNodes)
    for (let child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            var translatedText = translateText(child.data);
            if (translatedText !== child.data) {
                child.data = translatedText;
            }
        } else {
            translateChildren(child);
        }
    }
}

export function translateTextNode(el: any) {
    const lang = PreferencesManager.loadValue("lang") || "cn";
    if ((window as any).TM_translations === undefined) return;
    if ((window as any).TM_translations[lang] === undefined) return;

    translateChildren(el);
}

export const $t = translateText;
