import bcModSDKRef from "bondage-club-mod-sdk";
import { modules } from "Modules/ModulesDict";
import { BaseModule, XS_ModuleName } from "Modules/BaseModule";
import { CHANGELOG, ChangeType } from "changeLogData";


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
	if (DEBUG === false) return;

	let result: object = typeof msg === "string" ? {
		name: "XiaoSuActivity_Debug",
		type: MSGType.DebugLog,
		content: msg,
		time: new Date().toLocaleString(),
		ModVersion: XSActivity_VERSION,
	} : {
		name: msg.name,
		type: msg.type,
		content: msg.content,
		time: new Date().toLocaleString(),
		ModVersion: XSActivity_VERSION
	}
	console.debug(result);
}

export function GetModule(moduleName: XS_ModuleName): BaseModule | undefined {
	return modules[moduleName];
}


function removeElementsByTimeRange(element: HTMLElement, time_limit: timeRange) {
	const elements = element.querySelectorAll('[data-time]');

	elements.forEach((element) => {
		const dataTimeValue = element.getAttribute('data-time');

		if (dataTimeValue) {
			// 将字符串时间值转换为 Date 对象
			const currentTime = new Date(`2000-01-01 ${dataTimeValue}`);
			const minTimeDate = new Date(`2000-01-01 ${time_limit.minTime}`);
			const maxTimeDate = new Date(`2000-01-01 ${time_limit.maxTime}`);

			// 判断是否跨越了 00:00
			if (maxTimeDate < minTimeDate) {
				maxTimeDate.setDate(maxTimeDate.getDate() + 1);
			}

			// 判断是否在时间范围内
			if (currentTime < minTimeDate || currentTime > maxTimeDate) {
				// 使用 remove 方法
				element.remove();

				// 或者使用 parentNode.removeChild 方法
				// element.parentNode.removeChild(element);
			}
		}
	});
}


/**
 * 传入{@link copyAndDownloadHtmlElement}的最小时间值和最大时间值
 */
export interface timeRange {
	minTime: string;
	maxTime: string;
}


/**
 * 将传入的元素复制并提供下载
 * @param element 需要下载的原始元素
 * @param fileName 下载的文件名字
 * @param time_limit 时间范围
 * @returns void
 */
export function copyAndDownloadHtmlElement(element: HTMLElement | null, fileName: string, time_limit: timeRange | null = null) {
	// 创建新文档
	const newDoc = document.implementation.createHTMLDocument();

	if (element === null) {
		conDebug("element is null");
		return;
	}

	function clearElementStyle(element: HTMLElement) {
		const style = element.style;
		// 逐个删除属性
		while (style.length > 0) {
			style.removeProperty(style[0]);
		}
	}

	// 复制元素
	const copiedElement = element.cloneNode(true) as HTMLElement;

	if (time_limit !== null) {
		removeElementsByTimeRange(copiedElement, time_limit);
	}

	clearElementStyle(copiedElement);

	copiedElement.style.fontSize = "14.784px";
	copiedElement.style.fontFamily = "Arial, sans-serif";
	copiedElement.style.display = "flex";
	copiedElement.style.flexDirection = "column";
	copiedElement.style.width = "70vw";

	newDoc.body.style.display = "flex";
	newDoc.body.style.alignItems = "center";
	newDoc.body.style.justifyContent = "center";
	newDoc.body.style.backgroundColor = "#f2f2f2";
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

/**
 * 发送更新信息到本地
 */
export function sendChangeLog() {
	let content = '';
	for (const c in CHANGELOG) {
		const version = CHANGELOG[c].version;
		const type = CHANGELOG[c].type == ChangeType.main ? "主版本" : "开发版本";
		const description = CHANGELOG[c].description;
		const changes = CHANGELOG[c].changes;

		let changesString = '<ul style="list-style-position: inside;  padding-left: 0;">';
		for (const s of changes) {
			changesString += `<li>${s}</li>`;
		}
		changesString += '</ul>';

		const backgroundColor = version == XSActivity_VERSION && (!DEBUG && type === "主版本") ? "#764460" : "#442E3A"
		const styleForP = 'style="font-weight: bold; margin: 0;"'
		content += `<div style="background-color: ${backgroundColor}; display: flex; flex-direction: column;"> <p ${styleForP}>版本: ${version}</p> <p ${styleForP}>类型: ${type}</p> <p ${styleForP}>描述: ${description}</p><p>----</p> <p ${styleForP}>改动: ${changesString}</p><p>========</p></div>`
	}
	content += "<p>==当前页面显示时间1分钟==</p>"
	ChatRoomSendLocal(content, 60000);
}