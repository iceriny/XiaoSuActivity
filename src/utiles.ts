import bcModSDKRef from "bondage-club-mod-sdk";

export const bcModSDK = bcModSDKRef.registerMod({
	name: "XiaoSuActivity",
	fullName: "XiaoSu's Activity Expand",
	version: XSActivity_VERSION.startsWith("v") ? XSActivity_VERSION.slice(1) : XSActivity_VERSION,
	repository: "https://github.com/littlesera/LSCG"
});