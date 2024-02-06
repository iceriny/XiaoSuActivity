import { conDebug, hookFunction, SendChat, MSGType } from "./utils";
 import { ModuleLoader } from "Modules/ModuleLoader";

function initWait() {
    conDebug({
        name: "Start Init",
        type: MSGType.Workflow_Log,
        content: "Init wait"
    });  
    if (CurrentScreen == null || CurrentScreen === 'Login') {
        hookFunction('LoginResponse', 0, (args, next) => {
            next(args);
            conDebug({
                name: `Init! LoginResponse caught`,
                content: args,
                type: MSGType.Workflow_Log
            });
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

    const moduleCount = ModuleLoader.LoadModules();
    
    conDebug({
        type: MSGType.Workflow_Log,
        name: "XSActivity Loaded!",
        content: `Loaded ${moduleCount} modules`
    });
}



initWait();
