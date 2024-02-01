import { conDebug, hookFunction, ModuleCategory,MSGType } from "utils";

hookFunction("ChatRoomRun", 30, (args, next) => {
    const result = next(args);
    conDebug({
        name: 'ChatRoomRunTest',
        type: MSGType.DebugLog,
        content: args
    });
     return result;
});