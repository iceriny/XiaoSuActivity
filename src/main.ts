import { conDebug, hookFunction, SendChat, MSGType } from "./utils";
import { ModVersion } from "declaration/dev_const";
import { ChatRoomModule } from "chatRoom";

function initWait() {
    conDebug({
        name: "Start Init",
        type: MSGType.Workflow_Log,
        content: "Init wait"
    });
    if (CurrentScreen == null || CurrentScreen === 'Login') {
        hookFunction('LoginResponse', 0, (args, next) => {
            conDebug({
                name: `Init! LoginResponse caught`,
                content: args,
                type: MSGType.Workflow_Log
            });
            next(args);
            const response = args[0];
            if (response && typeof response.Name === 'string' && typeof response.AccountName === 'string') {
                init();
            }
        });
    } else {
        conDebug({
            name: "logged",
            type: MSGType.Workflow_Log,
            content: "Already logged in, init"
        });
        init();
    }
}

export function init() {
    new ChatRoomModule();

    conDebug(`XSActivity Loaded! Version: ${ModVersion}`);
}



initWait();
