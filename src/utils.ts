import bcModSDKRef from "bondage-club-mod-sdk";
import { isDebug, ModVersion } from "declaration/dev_const";
import { ModuleLoader } from "Modules/ModuleLoader";
import { BaseModule } from "Modules/BaseModule";


// SDK
export const bcModSDK = bcModSDKRef.registerMod({
	name: "XiaoSuActivity",
	fullName: "XiaoSu's Activity Expand",
	version: XSActivity_VERSION.startsWith("v") ? XSActivity_VERSION.slice(1) : XSActivity_VERSION,
	repository: "https://github.com/iceriny/XiaoSuActivity"
});

export enum ModuleCategory {
	Core = -1,
	Global = 0,
	Test = 1
}

type PatchHook = (args: any[], next: (args: any[]) => any) => any;
export function hookFunction(target: string, priority: number, hook: PatchHook): () => void {
	const removeCallback = bcModSDK.hookFunction(target, priority, hook);
	return removeCallback;
}

export function SendChat(msg: string) {
	ServerSend("ChatRoomChat", { Type: "Chat", Content: msg })
}


// Utils
interface XSDebugMSG {
	name: string;
	type: MSGType;
	content: any;
}
export enum MSGType {
	DebugLog,
	Workflow_Log,
}
export function conDebug(msg: XSDebugMSG | string) {
	if (isDebug === false) return;

	let result: object;

	if (typeof msg === "string") {
		result = {
			name: "XiaoSuActivity_Debug",
			type: MSGType.DebugLog,
			content: msg,
			time: new Date().toLocaleString(),
			ModVersion: ModVersion
		}
	} else {
		result = {
			name: msg.name,
			type: msg.type,
			content: msg.content,
			time: new Date().toLocaleString(),
			ModVersion: ModVersion
		}
	}
	console.debug(result);
}

export function GetModule(moduleName: string): BaseModule {
	return ModuleLoader.modules[moduleName];
}