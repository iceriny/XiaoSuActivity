declare module 'segmentit';

declare const XSActivity_VERSION: string;
declare const DEBUG: boolean;
interface Window {
	XSActivity_Loaded?: boolean;
	XSActivity_VERSION?: string;
	BROWSER_NAME?: string;
	BROWSER_VERSION?: number;
}