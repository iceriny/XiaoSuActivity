import { hookFunction, sendLastChangeLog } from "utils";
import { BaseModule } from "./BaseModule";
import { CSShref } from "utils";


export const PlayerStorage = () => Player.XSA;
export const PlayerOnlineSharedSettingsStorage = () => Player.OnlineSharedSettings?.XSA;
export const ExtensionStorage = () => Player.ExtensionSettings.XSA as string;
const XSA_OnlineSharedSettingsDataKeyList = ['wombTattoosAppliedEffects', 'sensitiveLevel'];
export class DataModule extends BaseModule {

    // 获取用户代理字符串
    static userAgentString = navigator.userAgent;
    // 创建正则表达式，匹配常见的浏览器版本信息
    static browserVersionRegex = /(chrome|firefox|safari|opera|edge|msie|trident(?=\/))\/?\s*(\d+)/i;
    // 使用正则表达式匹配浏览器版本信息
    static match = this.userAgentString.match(this.browserVersionRegex);

    static DefaultData: XSA_Data = {
        haveWombTattoos: false,
        wombTattoosAppliedEffects: [],
        sensitiveLevel: 0,
        resistCount: 0,
        player_Progress: 0
    }
    static DefaultSetting: XSA_SettingsData = {

    }
    static DefaultOnlineSharedSettingsData: XSA_OnlineSharedSettingsData = {
        wombTattoosAppliedEffects: [],
        sensitiveLevel: 0
    }
    /**
     * 浏览器名称
     */
    static browserName = this.match ? this.match[1] : 'unknown';
    /**
     * 浏览器版本
     */
    static browserVersion = this.match ? parseInt(this.match[2]) : -1;

    static IsModUpDate: boolean = false;

    public Load(): void {
        DataModule.allDataTake();
        this.hookListHandle();
        DataModule.SyncDataForPlayer();

        this.hookListHandle();

        this.Loaded = true;
    }
    public Init(): void {
        this.priority = 99;

        window.BROWSER_NAME = DataModule.browserName;
        window.BROWSER_VERSION = DataModule.browserVersion;

        const linkElement = document.createElement("link");
        linkElement.rel = "stylesheet";
        linkElement.type = "text/css";
        linkElement.href = CSShref;

        // 将 link 元素插入到 head 标签中
        document.head.appendChild(linkElement);

    }

    private hookListHandle(): void {
        hookFunction('ChatRoomLeave', this.priority, (args, next) => {
            DataModule.allDataSave();

            setTimeout(() => {
                ActivityChatRoomArousalSync(Player);
            }, 1000);

            return next(args);
        });
        hookFunction('ChatRoomSync', this.priority, (args, next) => {
            DataModule.allDataSave();
            if (DataModule.IsModUpDate) {
                setTimeout(() => {
                    sendLastChangeLog();
                }, 2000);
                DataModule.IsModUpDate = false;
            }
            return next(args);
        });
    }

    /**
     * 从ExtensionStorage获取mod数据
     */
    public static allDataTake() {
        // 处理XSASettingAndData的获取 从ExtensionStorage获取数据
        if (ExtensionStorage()) {
            // 处理XSASettingAndData的获取 从ExtensionStorage获取数据
            Player.XSA = JSON.parse(LZString.decompressFromBase64(ExtensionStorage()) ?? '') as XSASettingAndData
            // 如果没有获取到数据则读取默认数据
            const afterVersion = Player.XSA.version;
            if (afterVersion !== XSActivity_VERSION) {
                this.IsModUpDate = true;
                Player.XSA.version = XSActivity_VERSION;
            }
            for (const k2 in Player.XSA.data) {
                if (Player.XSA.data[k2] === undefined) {
                    Player.XSA.data[k2] = this.DefaultData[k2]
                }
            }
            for (const k3 in Player.XSA.settings) {
                if (Player.XSA.settings[k3] === undefined) {
                    Player.XSA.settings[k3] = this.DefaultSetting[k3]
                }
            }
        } else {
            // 如果没有定义ExtensionStorage 则读取默认数据
            Player.XSA = {
                version: XSActivity_VERSION,
                data: this.DefaultData,
                settings: this.DefaultSetting
            }
            this.IsModUpDate = true;
        }

        // 将获取到的数据输出到PlayerOnlineSharedSettingsStorage
        if (PlayerOnlineSharedSettingsStorage()) {
            Player.OnlineSharedSettings!.XSA = {
                // 需要手动处理每一条需要的 PlayerOnlineSharedSettings 后续如果有使用额外的数据需要手动添加
                wombTattoosAppliedEffects: Player.XSA.data.wombTattoosAppliedEffects ?? [],
                sensitiveLevel: Player.XSA.data.sensitiveLevel ?? 0
            }
        } else {
            Player.OnlineSharedSettings!.XSA = this.DefaultOnlineSharedSettingsData
        }
    }

    /**
     * 储存设置到ExtensionStorage
     */
    public static allDataSave() {
        if (!ExtensionStorage()) {
            Player.ExtensionSettings.XSA = ''
        }
        const data: XSASettingAndData = {
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
        const OnlineSharedSettings = PlayerOnlineSharedSettingsStorage();
        for (const itemKey in dataItem) {
            if (data && data[itemKey] != dataItem[itemKey]) {
                data[itemKey] = dataItem[itemKey];
            }
            if (OnlineSharedSettings && XSA_OnlineSharedSettingsDataKeyList.includes(itemKey)) {
                OnlineSharedSettings[itemKey as keyof XSA_OnlineSharedSettingsData] = dataItem[itemKey];
            }
        }
    }
    /**
     * 将PlayerStorage中的数据同步到Player 在模块加载时 takeData后调用
     * @see Load
     * @returns 无
     */
    public static SyncDataForPlayer() {
        const data = PlayerStorage()?.data;
        if (!data) return;
        if (Player.ArousalSettings && Player.ArousalSettings.Progress && data.player_Progress) {
            Player.ArousalSettings.Progress = data.player_Progress;
        }
        ActivityOrgasmGameResistCount = data.resistCount ?? 0
    }
}