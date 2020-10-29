
import { PreferencesManager } from "../components/PreferencesManager";
import * as raw_translations from "../../assets/translations.json";

const TM_translations: {[x: string]: {[x: string]: string}} = raw_translations;

export function translateText(englishText: string): string {
    let translatedText = englishText;
    const lang = PreferencesManager.loadValue("lang") || "cn";
    if (lang === "en") return englishText;

    englishText = normalizeText(englishText);
    if(!englishText){
        return translatedText;
    }
    const languages = TM_translations[englishText];

    if (languages !== undefined && languages[lang] !== undefined) {
        translatedText = languages[lang];
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
    return text.replace(/[\n\r]/g, "").replace(/[ ]+/g, " ").trim();
}

function translateChildren(node: Node) {
    for (let i = 0, length = node.childNodes.length; i < length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.TEXT_NODE) {
            const text = child as Text;
            const translatedText = translateText(text.data);
            if (translatedText !== text.data) {
                text.data = translatedText;
            }
        } else {
            translateChildren(child);
        }
    }
}

export function translateTextNode(el: HTMLElement) {
    translateChildren(el);
}

export const $t = translateText;
