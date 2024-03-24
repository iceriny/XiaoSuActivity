/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModule } from "./BaseModule";
import { conDebug, GetModule, timeRange, sendChangeLog, SendLocalMessage, sendLastChangeLog } from "utils";
import { ChatroomModule } from "./MChatroom";
import { ActivityModule } from "./MActivity";
import { ChessModule, Chess } from "./MChess";
import { Localization as L } from "localization";

const timeRangeRegex: RegExp = /^((0|1)\d|2[0-3]):[0-5]\d(:[0-5]\d)?-((0|1)\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;// 00:00(:00)-00:00(:00)

export class CommandsModule extends BaseModule {

    commandsDict: { [CommandName: string]: ICommand } = {
        help: {
            Tag: "help",
            Description: L.get("Command", "desc.help"),
            Action: (_args, _msg, _parsed) => {
                this.DisplayHelp();
            }
        },
        export: {
            Tag: "export",
            Description: L.get("Command", "desc.export"),
            Action: (_args, _msg, parsed) => {
                const params: string = this.getCommandParameters(parsed);
                if (params == 'h') {
                    ChatRoomSendLocal(L.get("Command", "help.export"), 20000)
                } else if (params === '') {
                    // 导出当前聊天室的全部聊天记录
                    conDebug("导出当前聊天室的全部聊天记录");
                    GetModule<ChatroomModule>("ChatroomModule").ExportChat();
                }
                else if (timeRangeRegex.test(params)) {
                    // 导出指定时间段的聊天记录 
                    conDebug(`导出指定的 ${params} 时间段的聊天记录`);
                    const separatorIndex = params.indexOf('-');

                    if (separatorIndex !== -1) {
                        const startTime = params.slice(0, separatorIndex).trim();
                        const endTime = params.slice(separatorIndex + 1).trim();

                        const time_limit: timeRange = {
                            minTime: startTime,
                            maxTime: endTime
                        };
                        GetModule<ChatroomModule>("ChatroomModule").ExportChat(time_limit);
                    }
                }

            }
        },
        v: {
            Tag: "v",
            Description: L.get("Command", "desc.v"),
            Action: (_args, _msg, _parsed) => {
                sendChangeLog();
            }
        },
        new: {
            Tag: "new",
            Description: L.get("Command", "desc.new"),
            Action: (_args, _msg, _parsed) => {
                sendLastChangeLog()
            }
        },
        act: {
            Tag: "act",
            Description: L.get("Command", "desc.act"),
            Action: (_args, _msg, _parsed) => {
                let content = ''
                GetModule<ActivityModule>("ActivityModule").getAllAct().forEach((item) => {
                    content += `<p style="font-weight: bold; margin: 0;">${item}</p>`
                })
                conDebug(`command: AL    content: ${content}`)

                ChatRoomSendLocal(content, 20000)
            }
        },
        jieba: {
            Tag: "jieba",
            Description: L.get("Command", "desc.jieba"),
            Action: (_args, _msg, _parsed) => {
                const stressStyle = "style='word-wrap: break-word;list-style: square;color: #FFCEE9;background-color: #AB6B8E;border-radius: 3px;padding: .2em .6em;margin: .2em .6em;'"
                const weakStyle = "style='word-wrap: break-word;list-style: square;color: #B0809B;background-color: #AB6B8E;border-radius: 3px;padding: .2em .6em;margin: .2em .6em;'"
                ChatRoomSendLocal(L.get("Command", "help.jieba", stressStyle, weakStyle))
            }
        },
        // edge: {
        //     Tag: "edge",
        //     Description: "显示 关于边缘机制的修改内容帮助.",
        //     Action: (_args,_msg, _parsed) => {
        //         ChatRoomSendLocal(`模组修改了的边缘机制:
        //         每持续45秒钟边缘 ,将提高一层高潮抵抗难度，并且增加0.3~1.3秒的即将到来的高潮的持续时间-最多27秒持续时间.
        //         如果失去边缘状态，将每45秒钟降低一层高潮抵抗难度，并且减少0.3~1.3秒的即将到来的高潮的持续时间-最少高潮持续时间范围4~7秒.
        //         `)
        //     }
        // },
        // orgasm: {
        //     Tag: "orgasm",
        //     Description: "显示 关于高潮机制的修改内容帮助.",
        //     Action: (_args, _msg, _parsed) => {
        //         ChatRoomSendLocal(`当角色抵抗高潮时被挠痒，则重新开始抵抗并且增加一层难度\n当高潮或抵抗高潮时禁用输入框.\n现在温度计进度和高潮抵抗难度不会随着重新登陆或跨平台而丢失.`)
        //     }
        // },
        kaomoji: {
            Tag: "kaomoji",
            Description: L.get("Command", "desc.kaomoji"),
            Action: () => {
                const stressStyle = "style='word-wrap: break-word;list-style: square;color: #FFCEE9;background-color: #AB6B8E;border-radius: 3px;padding: .2em .6em;margin: .2em .6em;'"
                const weakStyle = "style='word-wrap: break-word;list-style: square;color: #B0809B;background-color: #AB6B8E;border-radius: 3px;padding: .2em .6em;margin: .2em .6em;'"
                ChatRoomSendLocal(L.get("Command", "help.kaomoji", stressStyle, weakStyle))
            }
        },
        // yw: {
        //     Tag: "yw",
        //     Description: "淫纹大修说明! ",
        //     Action: (_args, _msg, _parsed) => {
        //         SendLocalMessage(`
        //         1. 淫纹现在不属于Cosplay物品 换句话说,如果 勾选设置-在线-禁止其他玩家更改cosplay物品 也不会影响其他人能够更换你的淫纹，但这需要两人都装上本模组.
        //         2. 玩家穿戴淫纹时，如果激活 心(小) 的图层 则激活本大修. 这意味着，从RP角度来说，心(小) 属于淫纹的核心.
        //         3. 玩家的不同的淫纹可以触发不同的效果。有的效果需要多个图层同时激活才能触发。
        //         4. 当想要某效果，但不想要对应的样式时，可以激活对应的图层但调整不透明度为0.
        //         -------------------

        //         淫纹的效果为:

        //         a. 心(小) 图层激活时，将触发本大修.
        //         b. 叶子 图层激活时，触发 【敏感】效果. 「 玩家的温度计上升速度将提高两倍，每激活一个淫纹效果，额外提高0.5倍. 」
        //         c. 爆炸 图层激活时，触发 【粉异电流】效果. 「 每过200毫秒则有 0.15% 的概率触发一次产生剧烈快感的电流.换句话说: 时间越久概率越大，77秒后的触发概率为50%. 」
        //         d. 开花 飞 图层激活时，触发 【迷幻】效果. 「 每过10~20分钟，将触发一次迷幻效果，持续20秒. 在触发期间，可能爆发毁灭高潮，可能随机的出现温度计上涨的情况. 触发迷幻效果时将缓慢进出房间，缓慢程度随机.」
        //         e. 其他效果敬请期待....
        //         -------------------
        //         `)
        //     }
        // }
        chess: {
            Tag: "chess",
            Description: L.get("Command", "desc.chess"),
            Action: (args, msg, parsed) => {
                const params: string = this.getCommandParameters(parsed);
                if (params === '') {
                    GetModule<ChessModule>('ChessModule').ShowChessboard(
                        {
                            Player1: Player.MemberNumber ?? -1,
                            Player2: null,
                            Round: 0,
                            Checkerboard: Chess.newCheckerboard,
                            start: false,
                            sender: Player.MemberNumber ?? -1
                        },
                        Player.MemberNumber ?? -1,
                    );
                } else if (params === 'h') {
                    SendLocalMessage(L.get("Command", "help.chess"))
                }

            }
        }
    }

    public Load(): void {
        CommandCombine(
            {
                Tag: "xsa",
                Description: L.get("Command", "desc.mainCommand"),
                Action: (args, msg, parsed) => {
                    if (parsed.length > 0) this.CommandHandler(parsed);
                    else this.DisplayHelp();
                },
                AutoComplete: (parsed, low, msg) => {
                    let word: string = "";
                    const commandsList: string[] = [];
                    for (const c in this.commandsDict) {
                        commandsList.push(c);
                    }
                    const foundCommands: string[] = [];
                    commandsList.forEach(c => {
                        if (c.startsWith(parsed[0])) {
                            foundCommands.push(c);
                        }
                    });
                    if (foundCommands.length === 1) {
                        word = foundCommands[0];
                        if(parsed.length > 1) ChatRoomSendLocal(`${this.commandsDict[word].Description}`, 3000);
                    } if (foundCommands.length > 1) {
                        let content: string = ``;
                        for (const c of foundCommands) {
                            content += `/xsa ${c} ${this.commandsDict[c].Description}\n`;
                        }
                        content += `${L.get("Command", "desc.version")}: ${XSActivity_VERSION}\n`
                        ChatRoomSendLocal(content, 3000);
                    }
                    if (word !== "") ElementValue("InputChat", CommandsKey + "xsa " + word);
                    ElementFocus("InputChat");
                }
            }
        )

        this.Loaded = true;
    }
    public Init(): void {
        this.priority = 20;
    }


    private getCommandParameters(parsed: string[]): string {
        // if (parsed.length === 0) {
        //     return '';
        // }
        const lastParam = parsed[parsed.length - 1];
        if (lastParam.startsWith("-")) {
            return lastParam.slice(1);
        }
        return '';
    }

    private DisplayHelp(msg?: string): void {
        if (msg === undefined) {
            let content: string = ``;
            for (const c in this.commandsDict) {
                content += `/xsa ${c} ${this.commandsDict[c].Description}\n`;
            }
            content += `${L.get("Command", "desc.version")}: ${XSActivity_VERSION}\n`
            ChatRoomSendLocal(content, 10000);
        } else {
            ChatRoomSendLocal(msg, 10000)
        }
    }

    private CommandHandler(parsed: Array<string>): void {
        const parsedCount: number = parsed.length;
        if (parsedCount == 0) this.DisplayHelp();
        if (parsedCount >= 1) {
            const last = parsed[parsedCount - 1];
            if (last.startsWith("-")) {
                const cmd: string = parsed[parsedCount - 2];
                if (cmd in this.commandsDict) {
                    this.commandsDict[cmd]?.Action?.('', '', parsed);
                }
            } else {
                if (last in this.commandsDict) {
                    this.commandsDict[last]?.Action?.('', '', parsed);
                }
            }
        }
    }
}