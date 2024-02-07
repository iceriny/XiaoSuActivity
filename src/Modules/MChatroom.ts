import { conDebug, hookFunction, SendChat, MSGType, copyAndDownloadHtmlElement, timeRange } from "utils";
import { BaseModule, _module } from "Modules/BaseModule";

export class ChatroomModule extends BaseModule implements _module {

    public Load(): void {
        // hookFunction("ChatRoomSync", 30, (args, next) => {
        //     conDebug({
        //         name: 'ChatRoomSyncTest',
        //         type: MSGType.DebugLog,
        //         content: args
        //     });
        //     // SendChat("我是! 小酥的小白鼠! 吱吱吱吱~~~");
        //     return next(args);
        // });
        this.stammer("小 酥 必须 时刻 提醒自己 是 莹的私有物")

        ChatroomModule.Loaded = true;
    }
    public init(): void {
        this.moduleName = "ChatroomModule";
        this.priority = 30;
    }


    ExportChat(time_limit: timeRange | null = null): void {
        const exportName: string | undefined = `${ChatRoomData?.Name}_${new Date().toLocaleString()}`;

        const mainElement: HTMLElement | null = document.getElementById('TextAreaChatLog')

        copyAndDownloadHtmlElement(mainElement, exportName, time_limit)
    }

    /**
     * 根据空格 自动处理结巴效果
     * @param message 传入的信息
     * @returns 处理后的文本
     */
    stammer(message: string): string {
        const stringArray: string[] = message.split(' ');
        let result = '';

        // 遍历单词数组
        for (let i = 0; i < stringArray.length; i++) {
            // 将当前单词加入结果字符串
            result += stringArray[i];

            // 随机决定是否添加结巴效果
            if (Math.random() < 0.5) { // 假设添加结巴效果的概率为50%
                result += this.addStammerEffect();
            }

            // 添加-分隔符，除了最后一个单词外
            if (i < stringArray.length - 1) {
                result += '-';
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
    private addStammerEffect(): string {
        // 在这里实现添加结巴效果的逻辑，可以是随机的字符、重复的部分、乱序等等
        // 这里只是一个示例，你可以根据实际需求进行更复杂的处理
        return '...';
    }
}