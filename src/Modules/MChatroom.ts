import { conDebug, hookFunction, segmentForCH, MSGType, copyAndDownloadHtmlElement, timeRange } from "utils";
import { BaseModule, _module } from "Modules/BaseModule";

export class ChatroomModule extends BaseModule implements _module {

    public Load(): void {
        this.hookListHandler();

        ChatroomModule.Loaded = true;
    }
    public init(): void {
        this.moduleName = "ChatroomModule";
        this.priority = 30;
    }

    hookListHandler(): void {
        // hookFunction("ChatRoomSync", 30, (args, next) => {
        //     conDebug({
        //         name: 'ChatRoomSyncTest',
        //         type: MSGType.DebugLog, 
        //         content: args
        //     });
        //     // SendChat("我是! 小酥的小白鼠! 吱吱吱吱~~~");
        //     return next(args);
        // });

        hookFunction("CommandParse", 0,
            (args, next) => {
                let msg : string = args[0];
                // 匹配`开头的命令
                const match = msg.match(/^`([1-9])? (.*)/);
                if (match) msg = this.stammerHandler(match[2], parseInt(match[1]));

                args[0] = msg;
                return next(args);
            });
        // hookFunction("ServerSend", 0,
        //     (args, next) => {
        //         conDebug({
        //             name: 'ServerSendTest',
        //             type: MSGType.DebugLog,
        //             content: args
        //         });
        //         return next(args);
        //     });
    }


    ExportChat(time_limit: timeRange | null = null): void {
        const exportName: string | undefined = `${ChatRoomData?.Name}_${new Date().toLocaleString()}`;

        const mainElement: HTMLElement | null = document.getElementById('TextAreaChatLog')

        copyAndDownloadHtmlElement(mainElement, exportName, time_limit)
    }


    stammerHandler(content: string, tenfoldStammeringProbability: number): string {
        conDebug(`stammerHandler: content: ${content} tenfoldStammeringProbability: ${tenfoldStammeringProbability}`)

        // 处理结巴程度，默认结巴程度为5
        if (Number.isNaN(tenfoldStammeringProbability)) tenfoldStammeringProbability = 3;
        const stammeringProbability = tenfoldStammeringProbability / 10;

        // 使用segmentForCH进行分词，传入参数取消掉空白字符
        const segmentList = segmentForCH(content.replace(/\s/g, ""));

        // 如果segmentForCH没有返回内容，则使用源字符串通过空格分词
        const stringArray: string[] = segmentList ? segmentList : content.split(' ');

        return this.stammerForList(stringArray, stammeringProbability);
    }
    /**
     * 根据空格 自动处理结巴效果
     * @param message 传入的信息
     * @returns 处理后的文本
     */
    stammerForList(messageList: string[], stammeringProbability: number): string {
        //const stringArray: string[] = message.split(' ');
        let result = '';

        // 遍历单词数组
        for (let i = 0; i < messageList.length; i++) {
            // 将当前单词加入结果字符串
            const currentWord: string = messageList[i];
            result += currentWord;

            // 随机决定是否添加结巴效果
            if (Math.random() < stammeringProbability) { // 假设添加结巴效果的概率为50%
                result += this.addStammerEffect(currentWord);
            }

            // 添加-分隔符，最后一个单词后添加 「 ... 」
            if (i < messageList.length - 1) {
                if (Math.random() < stammeringProbability)
                result += '-';
            } else {
                result += '...';
            }
        }

        // 调试日志输出处理后的结果
        conDebug({
            name: 'stammer',
            type: MSGType.DebugLog,
            content: result
        });

        return result;
    }
    // 添加结巴效果的辅助方法
    private addStammerEffect(word: string, depth: number = 0): string {
        // 设置最大递归深度
        const maxDepth = 3;
        // 如果递归深度达到最大值，返回原单词
        if (depth >= maxDepth) {
            return word;
        }
        // 在这里实现添加结巴效果的逻辑，可以是随机的字符、重复的部分、乱序等等
        const randomNumber: number = Math.random();
        let result: string = randomNumber < 0.5 ? '...' : `-${word}`;

        if (Math.random() < 0.2) {
            result = this.addStammerEffect(result, depth + 1);
        }
        return result;
    }
}