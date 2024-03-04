/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModule } from "./BaseModule";
import { conDebug, GetModule, timeRange, sendChangeLog, SendLocalMessage, sendLastChangeLog } from "utils";
import { ChatroomModule } from "./MChatroom";
import { ActivityModule } from "./MActivity";
import { ChessModule } from "./MChess";

const timeRangeRegex: RegExp = /^(((0|1)\d|2[0-3]):[0-5]\d)-(((0|1)\d|2[0-3]):[0-5]\d)$/;

export class CommandsModule extends BaseModule {

    commandsDict: { [CommandName: string]: ICommand } = {
        help: {
            Tag: "help",
            Description: "显示 [小酥的活动模组] 的相关命令.",
            Action: (_args, _msg, _parsed) => {
                this.DisplayHelp();
            }
        },
        export: {
            Tag: "export",
            Description: "导出当前聊天室的聊天记录. 输入: ‘/xsa export -h’ 显示导出命令的使用方法.",
            Action: (_args, _msg, parsed) => {
                const params: string = this.getCommandParameters(parsed);
                if (params == 'h') {
                    ChatRoomSendLocal('输入: ‘/xsa export -[时间]’导出指定时间范围内的聊天记录.\n例如: ‘/xsa export -05:34-20:40’\n默认导出当前聊天室的全部聊天记录.\n注意! \n如果时间段过长例如第一天的05:34到第二天的06:00则可能出现导出错误.', 20000)
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
            Description: "显示 [小酥的活动模组] 的版本信息.",
            Action: (_args, _msg, _parsed) => {
                sendChangeLog();
            }
        },
        new: {
            Tag: "new",
            Description: "显示 [小酥的活动模组] 的最新更新日志.",
            Action: (_args, _msg, _parsed) => {
                sendLastChangeLog()
            }
        },
        act: {
            Tag: "act",
            Description: "显示 [小酥的活动模组] 所添加的全部动作列表.",
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
            Description: "显示 自动结巴效果 的命令帮助.",
            Action: (_args, _msg, _parsed) => {
                const stressStyle = "style='word-wrap: break-word;list-style: square;color: #FFCEE9;background-color: #AB6B8E;border-radius: 3px;padding: .2em .6em;margin: .2em .6em;'"
                const weakStyle = "style='word-wrap: break-word;list-style: square;color: #B0809B;background-color: #AB6B8E;border-radius: 3px;padding: .2em .6em;margin: .2em .6em;'"
                ChatRoomSendLocal(`输入: <span ${stressStyle}>\`</span><span ${stressStyle}>空格</span><span ${weakStyle}>空格</span> 开头的话将以口吃结巴的形式发出.\n结巴生效位置有两种方式: 如果键入两个<span ${stressStyle}>空格</span> 将会在空格位置概率产生结巴效果.\n如果键入一个<span ${stressStyle}>空格</span>将会使用分词系统进行结巴效果.\n该命令有一个可选参数:\n如果以<span ${stressStyle}>\`</span><span ${stressStyle}>[1-9]</span> 的形式作为开头，数字代表结巴程度，默认为3，越高将越口吃.\n不带结巴程度参数的例子:\n<span ${stressStyle}>\`</span> [要说 的 话]\n处理之后的效果就可能是:  「 要说...-的-的话... 」=>注意空格的位置.\n带参数的命令方法:\n<span ${stressStyle}>\`</span>3 [要说 的 话]\n此处的3就是结巴等级，代表着每处句子中的空格位置的词段都将有30%的概率发生结巴.上面的话就意味着发生了3等级的结巴效果.\n如果有两个空格: <span ${stressStyle}>\`</span>  [要说的话]\n💡另外: 如果数字后跟<span ${stressStyle}>m</span>结尾，则会在结巴处根据当前兴奋程度添加呻吟效果.`)
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
            Description: "显示 快速颜文字 的使用说明.",
            Action: () => {
                const stressStyle = "style='word-wrap: break-word;list-style: square;color: #FFCEE9;background-color: #AB6B8E;border-radius: 3px;padding: .2em .6em;margin: .2em .6em;'"
                const weakStyle = "style='word-wrap: break-word;list-style: square;color: #B0809B;background-color: #AB6B8E;border-radius: 3px;padding: .2em .6em;margin: .2em .6em;'"
                ChatRoomSendLocal(`输入<span ${stressStyle}>|</span>+<span ${weakStyle}>参数</span>，或点击聊天室输入栏下方的小按钮，显示颜文字面板。
                左键点击表情: 将表情插入到输入栏的光标当前位置;
                右键点击表情: 将表情以**星号消息的形式直接发出;
                中键点击表情: 将表情以普通消息发出.
                当前的参数有:
                <span ${stressStyle}>help</span>显示所有的参数作用。
                <span ${stressStyle}>all</span>显示全部表情包。
                <span ${stressStyle}>hp</span>显示开心的颜文字包。
                <span ${stressStyle}>sd</span>显示伤心的颜文字包。
                <span ${stressStyle}>sy</span>显示害羞的颜文字包。
                <span ${stressStyle}>ar</span>显示生气的颜文字包。
                <span ${stressStyle}>sp</span>显示惊讶的颜文字包。
                <span ${stressStyle}>cf</span>显示疑惑的颜文字包。
                <span ${stressStyle}>nt</span>显示顽皮搞怪的颜文字包。
                `)
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
            Description: "开始一场棋局! 谁来迎战?",
            Action: (args, msg, parsed) => {
                GetModule<ChessModule>('ChessModule').SendAChess(Player.MemberNumber ?? 0,undefined, 0)
            }
        }
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

    private DisplayHelp(msg: string | undefined = undefined): void {
        if (msg === undefined) {
            let content: string = ``;
            for (const c in this.commandsDict) {
                content += `/xsa ${c} ${this.commandsDict[c].Description}\n`;
            }
            content += `小酥的活动模组 版本号: ${XSActivity_VERSION}\n`
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