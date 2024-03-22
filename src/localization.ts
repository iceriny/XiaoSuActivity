import { hookFunction } from "utils";

export class Localization {
    private static readonly LINK: string = DEBUG ? 'https://iceriny.github.io/XiaoSuActivity/dev/' : 'https://iceriny.github.io/XiaoSuActivity/main/'
    public static STRINGS: IString;

    public static async init() {
        hookFunction("TranslationNextLanguage", 0, (args, next) => {
            next(args);
            Localization.init();
        })



        const L = localStorage.getItem("BondageClubLanguage");
        const lang = L ?? "EN";

        const href = this.LINK + `${lang}.json`

        fetch(href)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                Localization.STRINGS = data;
            })
            .catch((error) => {
                console.error(error);
            });
    }


    public static get<T extends FirstStringKey>(firstKey: T, key: strKey<T>, ...param: unknown[]): string {
        return new STR(firstKey, key)
            .SlotReplace(...param)
            .Personalize()
            .S;
    }

}

class STR<T extends FirstStringKey> {
    private str: string;
    public get S(): string {
        return this.str;
    }

    public constructor(firstKey: T, key: strKey<T>) {
        this.str = Localization.STRINGS[firstKey][key] as string;
        return this;
    }

    public SlotReplace(...param: unknown[]): STR<T> {
        this.str = this.str.replace(/\{([0-9]+)\}/g, (match, digits) => {
            const index = parseInt(digits, 10); // 将匹配到的数字字符串转换为数字索引
            try {
                return (param[index] as string).toString();
            } catch {
                throw new Error(`Index ${index} out of range in parameters array.`);
            }
        });
        return this;
    }

    public Personalize(): STR<T> {
        this.str = this.str.replace(/\{(he|her|it|they)\}/g, (match, pronoun) => {
            return Localization.STRINGS.Other[pronoun as strKey<'Other'>] as string;
        });
        return this;
    }


}