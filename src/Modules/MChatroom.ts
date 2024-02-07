import { conDebug, hookFunction, SendChat, MSGType , copyAndDownloadHtmlElement, timeRange} from "utils";
import { BaseModule, _module } from "Modules/BaseModule";

export class ChatroomModule extends BaseModule implements _module{

    public Load(): void {
        // hookFunction("ChatRoomLoad", 30, (args, next) => {
        //     conDebug({
        //         name: 'ChatRoomLoadTest',
        //         type: MSGType.DebugLog,
        //         content: args
        //     });
        //     // SendChat("我是! 小酥的小白鼠! 吱吱吱吱~~~");
        //     return next(args);
        // });

        ChatroomModule.Loaded = true;
    }
    public init(): void {
        this.moduleName = "ChatroomModule";
        this.priority = 30;
    }


    ExportChat(time_limit : timeRange | null = null) : void {
        const exportName : string | undefined = `${ChatRoomData?.Name}_${new Date().toLocaleString()}`;

        const mainElement : HTMLElement | null = document.getElementById('TextAreaChatLog')

        copyAndDownloadHtmlElement(mainElement, exportName, time_limit)
    }

    //stammer()
}