declare const XSActivity_VERSION: string;
declare const DEBUG: boolean;
declare let CHANGELOG: ChangeLogObj[];
interface Window {
	XSActivity_VERSION_Loaded?: boolean;
	XSActivity_VERSION_Version?: string;
}

declare enum ChangeType {
	main,
	dev
}
interface ChangeLogObj {
	version: string;
	description: string;
	type: ChangeType;
	changes: string[];
}
