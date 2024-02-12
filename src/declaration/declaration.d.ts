declare const XSActivity_VERSION: string;
declare const DEBUG: boolean;
interface Window {
	XSActivity_Loaded?: boolean;
	XSActivity_VERSION?: string;
	BROWSER_NAME?: string;
	BROWSER_VERSION?: number;
	/**
	 * 每边缘10秒增加1
	 */
	EdgeCount?: number;
}