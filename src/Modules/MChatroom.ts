import { conDebug, hookFunction, SendChat, MSGType , copyAndDownloadHtmlElement, timeRange} from "utils";
import { BaseModule } from "Modules/BaseModule";

export class Chatroom extends BaseModule {
    moduleName = "Chatroom";
    priority = 30;
    Load(): void {
        hookFunction("ChatRoomLoad", 30, (args, next) => {
            const result = next(args);
            conDebug({
                name: 'ChatRoomLoadTest',
                type: MSGType.DebugLog,
                content: args
            });
            // SendChat("我是! 小酥的小白鼠! 吱吱吱吱~~~");
            return result;
        });
    }


    ExportChat(time_limit : timeRange | null = null) : void {
        const exportName : string | undefined = `${ChatRoomData?.Name}_${new Date().toLocaleString()}`;

        const mainElement : HTMLElement | null = document.getElementById('TextAreaChatLog')

        copyAndDownloadHtmlElement(mainElement, exportName, time_limit)
    }
}