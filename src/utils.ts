import bcModSDKRef from "bondage-club-mod-sdk";
import { isDebug, ModVersion } from "declaration/dev_const";
import { modules } from "Modules/ModulesDict";
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
	return modules[moduleName];
}

export function copyAndDownloadHtmlElement(element: HTMLElement | null, fileName: string) {
	// 创建新文档
	const newDoc = document.implementation.createHTMLDocument();

	if (element === null){
		conDebug("element is null");
		return;
	}
	// 复制元素
	const copiedElement = element.cloneNode(true) as HTMLElement;
  
	// 将复制的元素添加到新文档的 body 中
	newDoc.body.appendChild(copiedElement);
  
	// 将新文档转换为 HTML 字符串
	const htmlString = newDoc.documentElement.outerHTML;
  
	// 创建一个下载链接
	const blob = new Blob([htmlString], { type: 'text/html' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = fileName;
  
	// 触发下载
	link.click();
  }