import { BaseModule } from "./BaseModule";
import { conDebug, MSGType } from "utils";

export class Commands extends BaseModule {
    moduleName = "Commands";
    priority = 20;

    public Load(): void {
        CommandCombine(
            {
                Tag: "xsa",
                Description: "显示 [小酥的活动模组] 的相关命令.",
                Action: (args, msg, parsed) => {
                    conDebug(
                        {
                            name: "CommandsTest",
                            type: MSGType.DebugLog,
                            content: {
                                "args": args,
                                "msg": msg,
                                "parsed": parsed
                            }
                        }
                    )
                }
            }
        )




        
    }
}