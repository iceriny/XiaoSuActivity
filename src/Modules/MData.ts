import { BaseModule, _module } from "./BaseModule";
import { conDebug } from "utils";

export class DataModule extends BaseModule implements _module {

    // 获取用户代理字符串
    static userAgentString = navigator.userAgent;
    // 创建正则表达式，匹配常见的浏览器版本信息
    static browserVersionRegex = /(chrome|firefox|safari|opera|edge|msie|trident(?=\/))\/?\s*(\d+)/i;
    // 使用正则表达式匹配浏览器版本信息
    static match = this.userAgentString.match(this.browserVersionRegex);
    /**
     * 游戏当前语言代码
     */
    static lang = TranslationLanguage.toLowerCase();

    /**
     * 浏览器名称
     */
    static browserName = this.match ? this.match[1] : 'unknown';
    /**
     * 浏览器版本
     */
    static browserVersion = this.match ? parseInt(this.match[2]) : -1;

    public Load(): void {
        this.moduleName = "DataModule";
        this.priority = 0;
        window.GAME_LANG = DataModule.lang;
    }
    public init(): void {
        window.BROWSER_NAME = DataModule.browserName;
        window.BROWSER_VERSION = DataModule.browserVersion;
        conDebug("MData: init");

    }

    public static getLangCode(): string {
        this.lang = TranslationLanguage.toLowerCase();
        window.GAME_LANG = this.lang;
        return this.lang;
    }
}