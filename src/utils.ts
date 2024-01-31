import bcModSDKRef from "bondage-club-mod-sdk";

export const bcModSDK = bcModSDKRef.registerMod({
	name: "XiaoSuActivity",
	fullName: "XiaoSu's Activity Expand",
	version: XSActivity_VERSION.startsWith("v") ? XSActivity_VERSION.slice(1) : XSActivity_VERSION,
	repository: "https://github.com/iceriny/XiaoSuActivity"
});
type PatchHook = (args: any[], next: (args: any[]) => any) => any;

export function hookFunction(target: string, priority: number, hook: PatchHook): () => void {
	const removeCallback = bcModSDK.hookFunction(target, priority, hook);
	return removeCallback;
}

export function SendChat(msg: string) {
    ServerSend("ChatRoomChat", {Type: "Chat", Content: msg})
}