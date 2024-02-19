import { conDebug, hookFunction, MSGType } from "./utils";
import { ModuleLoader } from "Modules/ModuleLoader";

function initWait() {
    conDebug({
        name: "Start Init",
        type: MSGType.Workflow_Log,
        content: "Init wait"
    });
    if (CurrentScreen == null || CurrentScreen === 'Login') {
        hookFunction('LoginResponse', 10, (args, next) => {
            const result = next(args);
            conDebug({
                name: `Init! Login Response caught`,
                content: args,
                type: MSGType.Workflow_Log
            });
            const response = args[0];
            if (response && typeof response.Name === 'string' && typeof response.AccountName === 'string' || !ModuleLoader.CompleteLoadingSuccessful) {
                init();
            }
            return result;
        });
    }
}

export function init() {
    if (window.XSActivity_Loaded)
        return;

    const InitModuleCount = ModuleLoader.InitModules();

    conDebug({
        type: MSGType.Workflow_Log,
        name: "XSActivity Initialized!",
        content: `Init ${InitModuleCount} modules `
    });

    const moduleCount = ModuleLoader.LoadModules();

    conDebug({
        type: MSGType.Workflow_Log,
        name: "XSActivity Loaded!",
        content: `Loaded ${moduleCount} modules    FullLoaded: ${ModuleLoader.CompleteLoadingSuccessful}`
    });

    if (!ModuleLoader.CompleteLoadingSuccessful) {
        throw new Error("XSActivity load or init failed");
    }
}



initWait();
