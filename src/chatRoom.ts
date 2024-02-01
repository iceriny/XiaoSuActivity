import { conDebug, hookFunction, ModuleCategory, MSGType } from "utils";
import { BaseModule } from "BaseModule";

export class ChatRoomModule extends BaseModule {
    Load(): void {
        hookFunction("ChatRoomLoad", 30, (args, next) => {
            const result = next(args);
            conDebug({
                name: 'ChatRoomRunTest',
                type: MSGType.DebugLog,
                content: args
            });
            return result;
        });
    }
}