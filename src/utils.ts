import bcModSDKRef from "bondage-club-mod-sdk";
import { MODULES } from "Modules/ModulesDict";
import { CHANGELOG, ChangeType } from "changeLogData";

//   VVVVVVVVVVVVVVVVVVVVVVVVVVVVV  ----用得到的常数---- VVVVVVVVVVVVVVVVVVVVVVV    //

export const CSShref = DEBUG ? "https://iceriny.github.io/XiaoSuActivity/dev/XSActivityStyle.css" : "https://iceriny.github.io/XiaoSuActivity/main/XSActivityStyle.css";

//   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ----用得到的常数---- ^^^^^^^^^^^^^^^^^^^^^^^    //


//   VVVVVVVVVVVVVVVVVVVVVVVVVVVVV  ----SDK----  VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV    //
export const bcModSDK = bcModSDKRef.registerMod({
    name: "XiaoSuActivity",
    fullName: "XiaoSu's Activity Expand",
    version: XSActivity_VERSION.startsWith("v") ? XSActivity_VERSION.slice(1) : XSActivity_VERSION,
    repository: "https://github.com/iceriny/XiaoSuActivity"
});

export type PatchHook = (args: any[], next: (args: any[]) => any) => any;
export function hookFunction(target: string, priority: number, hook: PatchHook): () => void {
    const removeCallback = bcModSDK.hookFunction(target, priority, hook);
    return removeCallback;
}

export function patchFunction(functionName: string, patches: Record<string, string | null>): void {
    bcModSDK.patchFunction(functionName, patches);
}

//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ----SDK----  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^    //
/**
 * 发送*表情信息
 * @param msg 要发送的内容
 * @returns 无
 */
export function SendEmote(msg: string | null) {
    if (msg == null) return;
    ServerSend("ChatRoomChat", { Content: msg, Type: "Emote" })
}
/**
 * 发送聊天消息
 * @param msg 发送的内容
 * @returns 无
 */
export function SendChat(msg: string | null) {
    if (msg == null) return;
    ServerSend("ChatRoomChat", { Type: "Chat", Content: msg })
}

type LocalMessageCSSName = null | 'local-message' | 'trance-message' | 'XSA_Chess'
export function SendLocalMessage(msg: string, className: LocalMessageCSSName = null, timeout: number = 0) {
    if (className !== null) {
        msg = `<div class="${className}">${msg}</div>`
    }
    if (timeout === 0) ChatRoomSendLocal(msg)
    else ChatRoomSendLocal(msg, timeout);
}
/**
 * 发送动作消息
 * @param msg 动作消息的内容
 * @param sourceCharacter 动作的来源 id
 * @param targetCharacter 动作的目标 id
 */
export function SendActivity(msg: string, sourceCharacter: number, targetCharacter?: number) {

    const sourceCharacterObj: Character | undefined = ChatRoomCharacter.find(c => c.MemberNumber == sourceCharacter),
        targetCharacterObj: Character | undefined = targetCharacter ? ChatRoomCharacter.find(c => c.MemberNumber == targetCharacter) : undefined;

    if (sourceCharacterObj === undefined && targetCharacterObj === undefined) return;

    const sourceCharacterNickname = sourceCharacterObj ? CharacterNickname(sourceCharacterObj) : "",
        targetCharacterNickname = targetCharacterObj ? CharacterNickname(targetCharacterObj) : "";
    const resultDict: ChatMessageDictionary = [
        { Tag: "MISSING ACTIVITY DESCRIPTION FOR KEYWORD XSA_ActMessage", Text: msg.replaceAll("{source}", sourceCharacterNickname).replaceAll("{target}", targetCharacterNickname) }
    ]

    resultDict.push({ SourceCharacter: sourceCharacter });
    if (targetCharacter !== undefined) resultDict.push({ TargetCharacter: targetCharacter });
    conDebug({
        type: MSGType.Workflow_Log,
        name: "SendActivity()",
        content: {
            Type: "Activity", Content: "XSA_ActMessage", Dictionary: resultDict, Sender: sourceCharacter
        }
    });

    ServerSend("ChatRoomChat", {
        Type: "Activity", Content: "XSA_ActMessage", Dictionary: resultDict, Sender: sourceCharacter
    });
}


//   ^^^^^^^^^^^^^^^  ----游戏函数调用----  ^^^^^^^^^^^^^^^    //


/* 发送的数据包对象的实例
{
    "Sender": 150217,
    "Content": "ChatOther-ItemTorso-Tickle",
    "Type": "Activity",
    "Dictionary": [
        {
            "SourceCharacter": 150217
        },
        {
            "TargetCharacter": 155979
        },
        {
            "Tag": "FocusAssetGroup",
            "FocusGroupName": "ItemTorso"
        },
        {
            "ActivityName": "Tickle"
        },
        {
            "Tag": "fbc_nonce",
            "Text": 9
        }
    ],
    "MBCHC_ID": 44
}
*/
/**
 */
// Utils
/* 描述中表示自己的占位符 */

const selfPlaceholder = '{source}';
/** 描述中表示目标的占位符 */

const targetPlaceholder = '{target}';
/**
 * 包含全局占位符的对象 s:自己  t:目标
 */
export const PH = {
    s: selfPlaceholder,
    t: targetPlaceholder
}
/**
 * Debug信息对象接口
 */
interface XSDebugMSG {
    name?: string;
    type?: MSGType;
    content: any;
}
/**
 * Debug信息类型
 */
export enum MSGType {
    DebugLog,
    Workflow_Log,
}
/**
 * 发送debug信息到控制台
 * @param msg 信息
 * @param color 可选颜色参数
 * @param style 可选的css风格参数
 * @returns 无
 */
export function conDebug(msg: XSDebugMSG | string, color: string | null = null, style: string | null = null) {
    if (DEBUG === false) return;


    const result: object = typeof msg === "string" ? {
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
    if (style) {
        console.debug("%c小酥的模组信息: ", style, result);
    } else {
        if (color) {
            style = `background-color: ${color}; font-weight: bold;`
        }
        console.debug("%c小酥的模组信息: ", 'background-color: rgba(191, 154, 175, 1); font-weight: bold;', result);
    }
}

/**
 * 获取已加载的模型实例
 * @param moduleName 模型名称
 * @returns 已加载的模型实例
 */
export function GetModule<T>(moduleName: XS_ModuleName): T {
    return MODULES[moduleName] as T;
}

/**
 * 处理获取到的元素中时间范围外的元素 次工具在导出聊天记录时使用
 * @param element 获取的元素
 * @param time_limit 时间范围
 */
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

/**
 * 发送最新的更新信息到本地
 */
export function sendLastChangeLog() {
    let content = '';
    const c = CHANGELOG[CHANGELOG.length - 1];
    const version = c.version;
    const type = c.type == ChangeType.main ? "主版本" : "开发版本";
    const description = c.description;
    const changes = c.changes;
    const styleForP = 'style="font-weight: bold; margin: 0;"'

    for (const s of changes) {
        content += `<p ${styleForP}>${s}</p>`;
    }
    content = `<p ${styleForP}>版本: ${version}</p>
    <p ${styleForP}>类型: ${type}</p>
    <p ${styleForP}>描述: ${description}</p>
    <p>----</p>
    <p ${styleForP}>改动: ${content}</p>
    <p>========</p>`

    content += "<p>==当前页面显示时间30秒 再次查看请输入`/xsa new`==</p>"
    ChatRoomSendLocal(content, 30000);
}

/**
 * 处理结巴效果基于segmenter.segment()分词
 * @param str 传入的字符串
 * @returns 返回处理后的字符串
 */
export function segmentForCH(str: string): string[] | null {
    // 检查浏览器是否支持 Intl.Segmenter
    if (window.Intl && window.Intl.Segmenter && TranslationLanguage.toLowerCase() === "cn") {
        const segmenter = new Intl.Segmenter('zh', { granularity: 'word' }); // 创建分词器实例
        const segmenterResult = segmenter.segment(str); // 对文本进行分词
        const results: string[] = []
        for (const segment of segmenterResult) {
            results.push(segment.segment);
        }

        conDebug(`segmentForCH: ${results}`)
        return results;
    } else {
        return null;
    }
}
/**
 * 检测数字是否被整除
 * @param num 要检测的数字
 * @param divisor 除数
 * @returns 是否被整除
 */
export function isDivisible(num: number, divisor: number): boolean {
    return num % divisor === 0;
}


// 将滚动条滚动到底部
export function scrollToBottom(element: HTMLElement) {
    const maxScrollTop = element.scrollHeight - element.clientHeight;
    element.scrollTo({
        top: maxScrollTop,
        behavior: 'smooth'  // 可选：实现平滑滚动效果
    });
}

/**
 * 确定是否应渲染资产层，假设资产本身是可见的。
 * @param C - 角色，穿戴该物品的角色
 * @param layer - 需要检查可见性的层
 * @param asset - 层所属的资产
 * @param typeRecord - 如果有的话，物品的类型记录
 * @returns - 如果层应显示则返回 TRUE，否则返回 FALSE
 */
export function CharacterAppearanceIsLayerIsHave(C: Character, layer: AssetLayer, typeRecord: TypeRecord | null = null) {
    return !(layer.AllowTypes && typeRecord !== null && !CharacterAppearanceAllowForTypes(layer.AllowTypes, typeRecord));
}


/**
 * 获取一个随机整数
 * @param min 最小值
 * @param max 最大值
 * @returns 返回的随机整数
 */
export function GetRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}