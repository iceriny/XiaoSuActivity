declare const XSActivity_VERSION: string;
declare const DEBUG: boolean;
interface Window {
	XSActivity_Loaded?: boolean;
	XSActivity_VERSION?: string;
	BROWSER_NAME?: string;
	BROWSER_VERSION?: number;
	MODULES?: { [key: string]: unknown };
	XSA_STRINGS?: unknown;

	Emoji: unknown;

	AddChatRightClickEvent?: (div: HTMLDivElement) => void;
}
/**
 * mod模块名称定义
 */
type XS_ModuleName = "Base" | "TimerProcessInjector" | "ActivityModule"
	| "ChatroomModule" | "CommandsModule" | "DataModule" | 'DrawModule' | 'ChessModule'; // 'WombTattoosModule' | "ArousalModule"

//  vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv  //

/**
 * **MOD本地数据**
 * 在线公开数据见:
 * @see XSA_OnlineSharedSettingsData
 */

type XSASettingAndData = {
	version: string;
	settings: XSA_SettingsData;
	data: XSA_Data;
}

type XSA_SettingsData = {
	[key: string]: any;
}
type XSA_Data = {
	[key: string]: any;
	haveWombTattoos: boolean;
	wombTattoosAppliedEffects: WombTattoosEffect[];
	sensitiveLevel: number
	resistCount: number;
	player_Progress: number
}
type XSA_DataKey = Extract<keyof XSA_Data, string>;

type WombTattoosEffect = 'sensitive' | 'pinkShock' | 'trance'

interface PlayerCharacter {
	XSA?: XSASettingAndData;
}

/**
 * **MOD在线公开数据**
 * @ 本地数据见VVV
 * @see XSASettingAndData
 */
type XSA_OnlineSharedSettingsData = {
	wombTattoosAppliedEffects: WombTattoosEffect[];
	sensitiveLevel: number
}

interface CharacterOnlineSharedSettings {
	XSA?: XSA_OnlineSharedSettingsData;
}

type emojiItem = {
	"name": string,
	"zh_name": string,
	"emoji": string,
	"Rank": number,
	"Category": string,
	"Subcategory": string
}

type emojiItemKey = Extract<keyof emojiItem, string>;

interface emojiHandleEventData {
	keyword: string;
	emoji: unknown;
}
