import { conDebug, hookFunction, SendChat, MSGType , copyAndDownloadHtmlElement} from "utils";
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
            SendChat("ChatRoomLoadTest");
            return result;
        });
    }


    ExportChat() : void {
        const exportName : string | undefined = `${ChatRoomData?.Name}_${new Date().toLocaleString()}`;

        const mainElement : HTMLElement | null = document.getElementById('TextAreaChatLog')

        copyAndDownloadHtmlElement(mainElement, exportName)
    }
}