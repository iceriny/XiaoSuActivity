import { conDebug, hookFunction, SendChat, MSGType , copyAndDownloadHtmlElement, timeRange} from "utils";
import { BaseModule, _module } from "Modules/BaseModule";
import { Segment, useDefault } from 'segmentit';

export class ChatroomModule extends BaseModule implements _module{

    public Load(): void {
        // hookFunction("ChatRoomSync", 30, (args, next) => {
        //     conDebug({
        //         name: 'ChatRoomSyncTest',
        //         type: MSGType.DebugLog,
        //         content: args
        //     });
        //     // SendChat("我是! 小酥的小白鼠! 吱吱吱吱~~~");
        //     return next(args);
        // });
        this.stammer("小酥必须时刻提醒自己是莹的私有物")

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

    stammer(message : string) : Array<any> {
        const segmentit = useDefault(new Segment());

        const result = segmentit.doSegment(message);
        conDebug({
            name: 'stammer',
            type: MSGType.DebugLog,
            content: result
        })

        return result;
    }
}