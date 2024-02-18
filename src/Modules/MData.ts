import { hookFunction } from "utils";
import { BaseModule } from "./BaseModule";
export const PlayerStorage = () => Player.XSA;
export const ExtensionStorage = () => Player.ExtensionSettings.XSA as string;
export class DataModule extends BaseModule {

    // 获取用户代理字符串
    static userAgentString = navigator.userAgent;
    // 创建正则表达式，匹配常见的浏览器版本信息
    static browserVersionRegex = /(chrome|firefox|safari|opera|edge|msie|trident(?=\/))\/?\s*(\d+)/i;
    // 使用正则表达式匹配浏览器版本信息
    static match = this.userAgentString.match(this.browserVersionRegex);

    static DefaultData: XSA_Data = {
        haveWombTattoos: false,
        WombTattoosAppliedEffects: []
    }
    static DefaultSetting: XSA_SettingsData = {

    }
    /**
     * 浏览器名称
     */
    static browserName = this.match ? this.match[1] : 'unknown';
    /**
     * 浏览器版本
     */
    static browserVersion = this.match ? parseInt(this.match[2]) : -1;

    public Load(): void {
        this.hookListHandle();

        DataModule.allDataTake();

        this.Loaded = true;
    }
    public Init(): void {
        this.moduleName = "DataModule";
        this.priority = 0;

        window.BROWSER_NAME = DataModule.browserName;
        window.BROWSER_VERSION = DataModule.browserVersion;

    }

    private hookListHandle() :void{
        hookFunction('ChatRoomLeave', this.priority, (args, next)=>{
            DataModule.allDataSave();
            return next(args);
        })
    }

    /**
     * 从ExtensionStorage获取mod数据
     */
    public static allDataTake() {
        if (ExtensionStorage()) {
            Player.XSA = JSON.parse(LZString.decompressFromBase64(ExtensionStorage()) ?? '') as XSASettingData
        } else {
            Player.XSA = {
                version: XSActivity_VERSION,
                data: this.DefaultData,
                settings: this.DefaultSetting
            }
        }
    }

    /**
     * 储存设置到ExtensionStorage
     */
    public static allDataSave() {
        if (!ExtensionStorage()) {
            Player.ExtensionSettings.XSA = ''
        }
        const data: XSASettingData = {
            version: PlayerStorage()?.version ?? XSActivity_VERSION,
            settings: PlayerStorage()?.settings ?? <XSA_SettingsData>{},
            data: PlayerStorage()?.data ?? <XSA_Data>{},
        }
        Player.ExtensionSettings.XSA = LZString.compressToBase64(JSON.stringify(data));
        ServerPlayerExtensionSettingsSync('XSA');
    }

    /**
     * 保存设置到PlayerStorage
     * @param settingKey 要保存的设置 key
     * @param settingValue 要保存的值
     */
    public static SaveSettings(settingsItem: { [settingKey: string]: any }): void {
        const settingsData = PlayerStorage()?.settings;
        for (const item in settingsItem) {
            if (settingsData && settingsData[item] != settingsItem[item]) {
                settingsData[item] = settingsItem[item];
            }
        }
    }
    public static SaveData(dataItem: { [dataKey: string]: any }): void {
        const data = PlayerStorage()?.data;
        for (const item in dataItem) {
            if (data && data[item] != dataItem[item]) {
                data[item] = dataItem[item];
            }
        }
    }
}