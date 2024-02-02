import { BaseModule } from "./BaseModule";
import { conDebug, MSGType } from "utils";

enum CommandLevel {
    first = 1,
    second = 2,
    third = 3,
}
export class Commands extends BaseModule {
    moduleName = "Commands";
    priority = 20;

    commandsDict: { [CommandLevel: string]: { [CommandName: string]: ICommand } } = {
        'first': {
            'help': {
                Tag: "help",
                Description: "显示 [小酥的活动模组] 的相关命令.",
                Action: (args, msg, parsed) => {
                    if (parsed.length > 0) this.CommandHandler(parsed);
                    else this.DisplayHelp();
                }
            },
            'export': {
                Tag: "export",
                Description: "导出当前聊天室的聊天记录.",
                Action: (args, msg, parsed) => {

                }
            }
        },
        'second': {},
        'third': {}
    }



    public Load(): void {
        CommandCombine(
            {
                Tag: "xsa",
                Description: "显示 [小酥的活动模组] 的相关命令.",
                Action: (args, msg, parsed) => {
                    if (parsed.length > 0) this.CommandHandler(parsed);
                    else this.DisplayHelp();
                }
            }
        )
    }

    private DisplayHelp(commandLevel: CommandLevel = CommandLevel.first): void {
        switch (commandLevel) {
            case CommandLevel.first:
                ChatRoomSendLocal(this.getHelpContent('first'), 5000);
                break;
            case CommandLevel.second:
                ChatRoomSendLocal(this.getHelpContent('second'), 5000);
                break;
            case CommandLevel.third:
                ChatRoomSendLocal(this.getHelpContent('third'), 5000);
                break;
        }
    }
    private getHelpContent(commandLevel: string) {
        let content: string = ``;
        for (const c in this.commandsDict[commandLevel]) {
            content += `/xsa ${c} ${this.commandsDict[commandLevel][c].Description}\n`;
        }
        return content
    }

    private CommandHandler(parsed: Array<string>): void {
        const parsedCount: number = parsed.length;
        switch (parsedCount + 1) {
            case 1:
                this.DisplayHelp();
                break;
            case 2:

                break;
            default:
                this.DisplayHelp();
        }
    }
}