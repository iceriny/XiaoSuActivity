import { conDebug, hookFunction, SendChat, MSGType } from "utils";
import { BaseModule } from "Modules/BaseModule";

export class ChatRoomModule extends BaseModule {
    moduleName = "ChatRoom";
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
}