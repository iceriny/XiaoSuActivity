import { BaseModule } from "Modules/BaseModule";
import {
    EmojiWorkerRef,
    MSGType,
    SendChat,
    SendEmote,
    SendLocalMessage,
    conDebug,
    copyAndDownloadHtmlElement,
    hookFunction,
    patchFunction,
    timeRange,
} from "utils";
import { Localization as L } from "localization";
import { Emoji } from "./Emoji";

export class ChatroomModule extends BaseModule {
    // VVVV==========初始化与加载函数==========VVVV //
    public Load(): void {
        this.hookListHandler();
        this.pathListHandler();

        this.Loaded = true;
    }
    public Init(): void {
        if (!window.AddChatRightClickEvent)
            window.AddChatRightClickEvent = this.AddChatRightClickEvent;
        document.addEventListener("click", () => {
            ChatroomModule.HideContextmenu();
        });
        this.priority = 30;

        ChatroomModule.contextmenuText = [
            ["reply", L.get("Chatroom", "Contextmenu.Button.reply")],
            ["whisper", L.get("Chatroom", "Contextmenu.Button.whisper")],
            ["copy", L.get("Chatroom", "Contextmenu.Button.copy")],
            ["delete", L.get("Chatroom", "Contextmenu.Button.delete")],
        ];

        for (let i = 0; i <= 9; i++) {
            this.moan.push(
                L.get("Chatroom", `moan.${i}` as strKey<"Chatroom">)
            );
        }

        for (let i = 0; i <= 7; i++) {
            ChatroomModule.kaomojiSet.help.push(
                L.get("Chatroom", `kaomojiHelp.${i}` as strKey<"Chatroom">)
            );
        }
    }

    static InputElement: HTMLInputElement | null = null;

    /**
     * hook函数列表处理
     */
    hookListHandler(): void {
        // 生成InputChat元素时将InputChat元素保存起来
        hookFunction("ChatRoomCreateElement", 0, (args, next) => {
            next(args);
            ChatroomModule.InputElement = document.getElementById(
                "InputChat"
            ) as HTMLInputElement;

            ChatroomModule.InputElement.addEventListener("input", (e) => {
                // Todo: 完成输入框监听时的处理程序
                ChatroomModule.inputHandle(e);
            });

            ChatroomModule.buildKaomojiButton();

            return result;
        });

        // 调整按钮位置
        hookFunction("ElementPosition", this.priority, (args, next) => {
            const result = next(args);
            if (args[0] === "InputChat") {
                ChatroomModule.ResizeKaomojiButton();
            }
            return result;
        });
        // 生成InputChat元素时将InputChat元素保存起来
        // hookFunction("ElementCreateTextArea", this.priority, (args, next) => {
        //     const result = next(args);
        //     if (args[0] === "InputChat") {
        //         ChatroomModule.InputElement = document.getElementById('InputChat') as HTMLInputElement;
        //     }
        //     return result;
        // });

        // 当聊天室清理全部元素时 删除表情系统元素
        hookFunction(
            "ChatRoomClearAllElements",
            this.priority,
            (args, next) => {
                ChatroomModule.removeKaomojiMenu();
                ChatroomModule.InputElement = null;
                return next(args);
            }
        );
        // 当聊天室显示元素时 显示表情系统菜单
        hookFunction("ChatRoomShowElements", this.priority, (args, next) => {
            const result = next(args);
            ChatroomModule.showKaomojiMenu();
            return result;
        });
        // 当聊天室隐藏元素时 隐藏表情系统元素
        hookFunction("ChatRoomHideElements", this.priority, (args, next) => {
            const result = next(args);
            ChatroomModule.hideKaomojiMenu();
            return result;
        });

        // 让记录显示时间包含秒
        hookFunction("ChatRoomCurrentTime", 99, () => {
            const D = new Date();
            const hStr = `0${D.getHours()}`;
            const mStr = `0${D.getMinutes()}`;
            const sStr = `0${D.getSeconds()}`;
            return `${hStr.substring(hStr.length - 2)}:${mStr.substring(
                mStr.length - 2
            )}:${sStr.substring(sStr.length - 2)}`;
        });

        // 处理聊天室发送消息时 接受 " ` " 命令和 接受 " | " 命令
        hookFunction("CommandParse", 0, (args, next) => {
            let msg = args[0];

            // 匹配[ ` ]开头的命令 处理结巴系统
            const match = msg.match(/^`([1-9])?(m)?( )? (.*)/);
            if (match) {
                msg =
                    match[2] != "m"
                        ? this.stammerHandler(
                              match[4],
                              parseInt(match[1]),
                              true,
                              false
                          )
                        : this.stammerHandler(
                              match[4],
                              parseInt(match[1]),
                              true,
                              true
                          );
            }

            // 匹配[ | ]的颜文字命令 处理表情系统
            const kaomojiMatch = msg.match(/^\|(.*)/);
            if (kaomojiMatch) {
                if (
                    Object.keys(ChatroomModule.kaomojiSet).includes(
                        kaomojiMatch[1]
                    ) ||
                    kaomojiMatch[1] == "all"
                ) {
                    ChatroomModule.kaomojiHandler(kaomojiMatch[1]);
                    const inputElement: HTMLInputElement =
                        document.getElementById(
                            "InputChat"
                        ) as HTMLInputElement;
                    inputElement.value = "";
                } else {
                    ChatRoomSendLocal(
                        L.get("Chatroom", "kaomoji.doesNotExist.tips"),
                        5000
                    );
                    const inputElement: HTMLInputElement =
                        document.getElementById(
                            "InputChat"
                        ) as HTMLInputElement;
                    inputElement.value = "|";
                }
                return;
            }
            args[0] = msg;
            return next(args);
        });

        // 处理聊天室接受消息时 的 " 🪧回复* " 命令显示
        hookFunction("ChatRoomMessage", 51, (args, next) => {
            const msg = args[0];
            const type = msg.Type;
            if (type === "Chat") {
                const content = msg.Content;
                const matchWord = L.get("Chatroom", "Prefix.reply");
                if (content.startsWith(`🪧${matchWord}*>`)) {
                    const match = content.match(
                        new RegExp(`^🪧${matchWord}\\*>(.+)<\\*(.+)`, "s")
                    );
                    conDebug({
                        name: "ChatRoomMessage 回复debug",
                        content: match,
                    });
                    if (match) {
                        ChatRoomSendLocal(
                            `·🪧·  ${matchWord}==>  ${match[1]}  ·🪧·`
                        );
                        args[0].Content = match[2];
                    }
                }
            }
            next(args);
        });
    }

    pathListHandler(): void {
        // 处理将消息添加右键菜单 (回复、复制、悄悄话、删除)
        if (GameVersion === "R104") {
            patchFunction("ChatRoomMessageDisplay", {
                "div.innerHTML = displayMessage;": `
                if (!!window.AddChatRightClickEvent) window.AddChatRightClickEvent(div);
                div.innerHTML = displayMessage;
                `,
            });
        } else {
            // R105
            hookFunction("ChatRoomMessageDisplay", 0, (args, next) => {
                // TODO: Remove the `void`-to-`HTMLDivElement` casting once the BC R105 annotations are available
                const div = next(args) as any as HTMLDivElement;
                if (window.AddChatRightClickEvent)
                    window.AddChatRightClickEvent(div);
                return div;
            });
        }
    }

    // -----------右键菜单----------- //
    AddChatRightClickEvent(div: HTMLDivElement) {
        const divClassName = div.className;
        if (
            !divClassName.includes("ChatMessageChat") &&
            !divClassName.includes("ChatMessageEmote")
        )
            return;
        // 右键点击事件监听器
        div.addEventListener("contextmenu", function (event) {
            // 阻止默认的右键点击事件
            event.preventDefault();
            // 自定义逻辑
            ChatroomModule.showContextmenu(event);
        });
    }
    /**     显示右键菜单      */
    private static Contextmenu: HTMLDivElement | null = null;
    /** 显示右键菜单的div元素 */
    private static targetDiv: HTMLDivElement | null = null;
    /** 右键菜单的内容 */
    private static contextmenuText: [
        [string, string],
        [string, string],
        [string, string],
        [string, string]
    ]; // [] = ["回复", "悄悄话", "复制", "删除"]
    /**
     * 显示右键菜单的功能实现。
     * 当用户在指定元素上右击时，此函数将显示一个右键菜单。
     * @param e 触发显示菜单的鼠标事件对象。用于获取事件的详细信息。
     * @returns void 无返回值。
     */
    private static showContextmenu(e: MouseEvent) {
        // 尝试将触发事件的目标元素转换为 HTMLDivElement
        const div = e.target as HTMLDivElement | null;
        // 如果目标元素不是 HTMLDivElement，则不执行任何操作
        if (!div) return;
        // 指定目标元素
        this.targetDiv = div;

        // 检查右键菜单是否已经存在
        // 如果不存在，则创建一个新的右键菜单
        // 如果存在，则显示右键菜单并调整其位置
        if (!this.Contextmenu) {
            ChatroomModule.buildNewContextmenu(e);
        } else {
            this.Contextmenu.style.display = "flex";
            ChatroomModule.changeContextmenuPosition(e);
        }
    }
    /**
     * 隐藏右键菜单
     */
    private static HideContextmenu() {
        if (this.Contextmenu) this.Contextmenu.style.display = "none";
    }

    /**
     * 构建并显示一个新的右键菜单。
     * @param e 鼠标事件，用于确定菜单的位置。
     */
    private static buildNewContextmenu(e: MouseEvent) {
        // 创建右键菜单的容器元素
        const contextmenu = document.createElement("div");
        contextmenu.className = "xsa-contextmenu"; // 设置菜单的类名
        contextmenu.style.display = "none"; // 初始时隐藏菜单

        this.Contextmenu = contextmenu; // 将菜单对象赋值给类的上下文菜单属性

        // 调整菜单的位置
        ChatroomModule.changeContextmenuPosition(e);

        // 循环创建菜单项
        for (let i = 0; i < 4; i++) {
            const buttonInfo = ChatroomModule.contextmenuText[i];
            const contextmenuItem = document.createElement("div"); // 创建菜单项
            contextmenuItem.className = "xsa-contextmenu-item"; // 设置菜单项的类名
            contextmenuItem.innerText = buttonInfo[1]; // 设置菜单项的文本

            const replyPrefix = L.get("Chatroom", "Prefix.reply");

            // 给菜单项添加点击事件监听
            contextmenuItem.addEventListener("click", () => {
                switch (buttonInfo[0]) {
                    case "reply": // 回复功能
                        ElementValue(
                            "InputChat",
                            `🪧${replyPrefix}*>${
                                ChatroomModule.targetDiv?.textContent
                            }<*\n${ElementValue("InputChat")}`
                        );
                        ElementFocus("InputChat");
                        break;
                    case "copy": // 复制功能
                        navigator.clipboard.writeText(
                            ChatroomModule.targetDiv?.textContent ?? ""
                        );
                        break;
                    case "whisper": {
                        // 私聊功能
                        //ElementValue("InputChat", `/whisper ${ChatroomModule.targetDiv?.getAttribute("data-sender")} ${ElementValue("InputChat").replace(/\/whisper\s*\d+ ?/u, '')}`);
                        const target =
                            ChatroomModule.targetDiv?.getAttribute(
                                "data-sender"
                            );
                        const targetNum = parseInt(target ?? "0");
                        if (
                            Number.isNaN(targetNum) ||
                            targetNum === Player.MemberNumber
                        )
                            return;
                        ChatRoomSetTarget(targetNum);
                        ChatRoomTarget();
                        ElementFocus("InputChat");
                        break;
                    }
                    case "delete": // 删除功能
                        ChatroomModule.targetDiv?.remove();
                }
            });

            contextmenu.appendChild(contextmenuItem); // 将菜单项添加到菜单容器
        }

        contextmenu.style.display = "flex"; // 显示菜单
        document.body.appendChild(contextmenu); // 将菜单添加到文档体中
    }

    /**
     * 根据鼠标事件改变右键菜单的位置
     * @param e 鼠标事件对象，用于获取鼠标位置
     */
    private static changeContextmenuPosition(e: MouseEvent) {
        // 如果不存在右键菜单，则直接返回
        if (!this.Contextmenu) return;

        // 计算右键菜单的水平位置
        let left = e.clientX;
        // 如果菜单位置超出屏幕右侧，则将菜单向左移动
        if (left + window.screen.width * 0.06 > window.screen.width) {
            left = e.clientX - window.screen.width * 0.06;
        }

        // 计算右键菜单的垂直位置
        let top = e.clientY;
        // 如果菜单位置超出屏幕下侧，则将菜单向上移动
        if (top + window.screen.height * 0.06 > window.screen.height) {
            top = e.clientY - window.screen.height * 0.06;
        }

        // 设置菜单的最终位置
        this.Contextmenu.style.left = `${left}px`;
        this.Contextmenu.style.top = `${top}px`;
    }
    // -----------右键菜单END----------- //

    // VVVV==========聊天记录模块==========VVVV //
    /**
     * 导出聊天记录
     * @param time_limit 时间范围
     */
    ExportChat(time_limit: timeRange | null = null): void {
        const exportName: string | undefined = `${
            ChatRoomData?.Name
        }_${new Date().toLocaleString()}`;

        const mainElement: HTMLElement | null =
            document.getElementById("TextAreaChatLog");

        copyAndDownloadHtmlElement(mainElement, exportName, time_limit);
    }

    // VVVV==========结巴模块==========VVVV //
    /**
     *
     * @param content 将要处理的句子内容
     * @param tenfoldStammeringProbability 结巴程度 [1 - 9]
     * @param isSegmentForCH 是否使用中文分词效果
     * @param haveMoan 是否呻吟
     * @returns 最终处理后的句子
     */
    stammerHandler(
        content: string,
        tenfoldStammeringProbability: number,
        isSegmentForCH: boolean,
        haveMoan: boolean
    ): string {
        conDebug(
            `stammerHandler: content: ${content} tenfoldStammeringProbability: ${tenfoldStammeringProbability}`
        );

        // 处理结巴程度，默认结巴程度为3
        if (Number.isNaN(tenfoldStammeringProbability))
            tenfoldStammeringProbability = 3;
        const stammeringProbability = tenfoldStammeringProbability / 10;

        // 使用segmentForCH进行分词，传入参数取消掉空白字符
        const segmentList = isSegmentForCH
            ? this.segmentForCH(
                  TranslationLanguage === "CN"
                      ? content.replace(/\s/g, "")
                      : content
              )
            : undefined;

        // 如果segmentForCH没有返回内容，则使用源字符串通过空格分词
        const stringArray: string[] = segmentList
            ? segmentList
            : content.split(" ");

        return this.stammerForList(
            stringArray,
            stammeringProbability,
            haveMoan
        );
    }

    /**
     * 处理结巴效果基于segmenter.segment()分词
     * @param str 传入的字符串
     * @returns 返回处理后的字符串
     */
    private segmentForCH(str: string): string[] | null {
        // 检查浏览器是否支持 Intl.Segmenter
        if (window.Intl && window.Intl.Segmenter) {
            const segmenter = new Intl.Segmenter(
                L.get(
                    "Other",
                    TranslationLanguage.toLowerCase() as strKey<"Other">
                ),
                { granularity: "word" }
            ); // 创建分词器实例
            const segmenterResult = segmenter.segment(str); // 对文本进行分词
            const results: string[] = [];
            for (const segment of segmenterResult) {
                results.push(segment.segment);
            }

            conDebug(`segmentForCH: ${results}`);
            return results;
        } else {
            return null;
        }
    }

    /** 呻吟词库 */
    moan: string[] = [];
    /**
     * 将分词后的句子添加效果并返回完整句子.
     * @param messageList 经过分词后的字符串列表
     * @param stammeringProbability 结巴程度 [0.1~0.9]
     * @param haveMoan 是否呻吟
     * @returns 返回处理后的完整句子.
     */
    private stammerForList(
        messageList: string[],
        stammeringProbability: number,
        haveMoan: boolean
    ): string {
        //const stringArray: string[] = message.split(' ');
        let result = "";

        // 遍历单词数组
        for (let i = 0; i < messageList.length; i++) {
            // 将当前单词加入结果字符串
            const currentWord: string = messageList[i];
            result += currentWord;

            // 随机决定是否添加结巴效果
            if (Math.random() < stammeringProbability) {
                // 假设添加结巴效果的概率为50%
                result += this.addStammerEffect(currentWord);
            }

            // 根据当前玩家的兴奋程度决定是否添加呻吟
            if (
                haveMoan &&
                Player.ArousalSettings?.Progress &&
                100 * Math.random() <= Player.ArousalSettings?.Progress
            ) {
                result +=
                    this.moan[Math.floor(Math.random() * this.moan.length)];
            }

            // 添加-分隔符，最后一个单词后添加 「 ... 」
            if (i < messageList.length - 1) {
                if (Math.random() < stammeringProbability) result += "-";
            } else {
                result += "...";
            }
        }

        // 调试日志输出处理后的结果
        conDebug({
            name: "stammer",
            type: MSGType.DebugLog,
            content: result,
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
        let result: string = randomNumber < 0.5 ? "..." : `-${word}`;

        if (Math.random() < 0.2) {
            result = this.addStammerEffect(result, depth + 1);
        }
        return result;
    }

    // VVVV==========颜文字表情模块==========VVVV //

    /** 表情菜单对象 */
    private static KaomojiMenuObject: {
        menu: HTMLDivElement | null;
        title: HTMLDivElement | null;
        container: HTMLDivElement | null;
    } = {
        menu: null,
        title: null,
        container: null,
    };

    /** 表情菜单标题元素 */
    private static menuTitleTextSet: { [key: string]: HTMLDivElement } = {
        all: document.createElement("div"),
        hp: document.createElement("div"),
        sd: document.createElement("div"),
        sy: document.createElement("div"),
        ar: document.createElement("div"),
        sp: document.createElement("div"),
        cf: document.createElement("div"),
        nt: document.createElement("div"),
    };

    /** 表情按钮 */
    static KaomojiButton: HTMLButtonElement | null = null;
    /** 是否应该显示表情菜单 处理跟随聊天室UI隐藏表情菜单时，等需要再显示时，菜单是否跟随显示 */
    static KaomojiShouldShow: boolean = false;

    /**
     * 处理颜文字表情系统
     * @param message 传入的信息，一般是命令
     */
    private static kaomojiHandler(message: string): void {
        const kaomojiMenu = this.getKaomojiMenu(message);
        kaomojiMenu!.style.display = "flex";
        this.KaomojiShouldShow = true;
    }

    /** 表情库 */
    private static kaomojiSet: { [groupName: string]: string[] } = {
        help: [],
        hp: [
            "ヾ(❀╹◡╹)ﾉ~",
            " (๑>؂<๑）",
            "(｡･ω･｡)ﾉ♡",
            "(◍ ´꒳` ◍)",
            "(￣w￣)ノ",
            "Hi~ o(*￣▽￣*)ブ",
            "(≧∇≦)ﾉ",
            "o(^▽^)o",
            "(￣︶￣)↗",
            "<(￣︶￣)↗[GO!]",
            "o(*￣▽￣*)o",
            "(p≧w≦q)",
            "ㄟ(≧◇≦)ㄏ",
            "(/≧▽≦)/",
            "(　ﾟ∀ﾟ) ﾉ♡",
            "(●'◡'●)",
            "ヽ(✿ﾟ▽ﾟ)ノ",
            "o(*￣︶￣*)o",
            "(๑¯∀¯๑)",
            "(≧∀≦)ゞ",
            "φ(≧ω≦*)♪",
            "╰(*°▽°*)╯",
            "(*^▽^*)",
            "(๑•̀ㅂ•́)و✧",
            "(੭*ˊᵕˋ)੭*ଘ*",
            "(o゜▽゜)o☆[BINGO!]",
            "(^▽^ )",
            "<(*￣▽￣*)/",
            "┌|*´∀｀|┘",
            "♪(´∇`*)",
            "(｡◕ฺˇε ˇ◕ฺ｡）",
            " ✌︎( ᐛ )✌︎",
            "(*・ω・)ﾉ",
            "(„• ֊ •„)",
        ],
        sd: [
            "テ_デ",
            "□_□",
            "┭┮﹏┭┮",
            "╥﹏╥...",
            "o(TヘTo)",
            "〒▽〒",
            "ε(┬┬﹏┬┬)3",
            "(;´༎ຶД༎ຶ`)",
            "(ノへ`、)",
            "（-_-。）",
            "(ノへ￣、)",
            "｡◔‸◔｡",
            "(⊙﹏⊙)",
        ],
        sy: [
            "|ω・）",
            "|･ω･｀)",
            "◕ฺ‿◕ฺ✿ฺ)",
            "つ﹏⊂",
            "(* /ω＼*)",
            "o(*////▽////*)q",
            "(*/ω＼*)",
            "(′▽`〃)",
            "(✿◡‿◡)",
            "(/▽＼)",
            "(๑´ㅂ`๑)",
            "(◡ᴗ◡✿)",
            "⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄",
            "(〃'▽'〃)",
            "(๑╹ヮ╹๑)ﾉ",
        ],
        ar: [
            "/ᐠ｡ꞈ｡ᐟ\\",
            "˃ʍ˂",
            "(σ｀д′)σ",
            "＼(゜ロ＼)(／ロ゜)／",
            "<(－︿－)>",
            "(ー`´ー)",
            "（｀へ´）",
            "(-__-)=@))> o<)",
            "(///￣皿￣)○～",
            "┻━┻︵╰(‵□′)╯︵┻━┻",
            "→)╥﹏╥)",
            "抽!!(￣ε(#￣)☆╰╮(￣▽￣///)",
            "(￣ε(#￣)☆╰╮o(￣皿￣///)",
            "(* ￣︿￣)",
            "（＃￣～￣＃）",
            "(⊙x⊙;)",
            "o(*≧▽≦)ツ┏━┓",
            "(ノω<。)ノ))☆.。",
            "(〃＞目＜)",
            "( σ'ω')σ",
            "o(′益`)o",
            "(〃＞目＜)",
            "o(≧口≦)o",
            "Ｏ(≧口≦)Ｏ",
            "...(*￣０￣)ノ[等等我…]",
            "（≧0≦）",
            "ψ(*｀ー´)ψ",
            "ψ(￣皿￣)ノ",
        ],
        sp: [
            "✧∇✧",
            "!!!∑(ﾟДﾟノ)ノ",
            "’(°ー°〃)",
            "ヾ(ノ' ﹃' )ノ",
            "(ーー゛)",
            "(○´･д･)ﾉ",
            "wow~ ⊙o⊙",
            "~(￣0￣)/",
            "Σ(｀д′*ノ)ノ",
            "Σ(っ °Д °;)っ",
            "(⊙ˍ⊙)",
            "w(ﾟДﾟ)w",
            "ｍ(o・ω・o)ｍ",
            "⊙▽⊙",
            "（இ௰இ）",
            "(●°u°●)​ 」",
            "（｡ò ∀ ó｡）",
            "(๑•̀ω•́)ノ",
        ],
        cf: [
            "⚆_⚆",
            "( -'`-)",
            "(=′ー`)",
            "( -'`-; )",
            "(・-・*)",
            "( ｀д′)",
            "(￣m￣）",
            "( ╯▽╰)",
            " o-o(=•ェ•=)m",
            "(⊙﹏⊙)",
            "Σ( ° △ °|||)︴",
            "(⊙ˍ⊙)",
            "( ᗜ ˰ ᗜ )",
            "꒰ ˶• ༝ •˶꒱",
        ],
        nt: [
            "(ˉ▽￣～) 切~~",
            "(￣w￣)ノ",
            "(￣v￣)ノ",
            "(￣l￣)ノ",
            "( ￣ー￣)",
            "(‾◡◝)",
            "(￣_,￣ )",
            "( ﹁ ﹁ ) ~→",
            "<(￣ ﹌ ￣)@m",
            "ꉂ-ꉂ(ˊᗜˋ*)",
            "(｀・ω・´）",
            "༼ つ ◕_◕ ༽つ",
            "ヽ(✿ﾟ▽ﾟ)ノ (°ー°〃)",
            "ヾ(￣▽￣)Bye~Bye~",
            "(◉ω◉υ)⁼³₌₃",
            "(●—●)",
            "(｡･∀･)ﾉﾞ",
            "┬─┬ ノ('-'ノ)",
            "┸━━┸)>口<)",
            "(-.-)..zzZZ",
            "(｡◝ᴗ◜｡)",
            " =͟͟͞͞(꒪ᗜ꒪ ‧̣̥̇)",
            "(˵¯͒〰¯͒˵)",
        ],
    };

    private static isKaomojiMenuCloseEventListenerAdded: boolean = false;
    /**
     * 构建表情按钮并返回按钮实例
     * @returns 创建的表情按钮
     */
    private static buildKaomojiButton(): HTMLButtonElement {
        if (this.KaomojiButton) return this.KaomojiButton;
        const button = document.createElement("button");
        button.id = "kaomoji-button";
        button.className = "kaomoji-button";
        button.type = "button";
        button.addEventListener("click", () => {
            if (
                !this.KaomojiMenuObject.menu ||
                this.KaomojiMenuObject.menu.style.display === "none"
            ) {
                this.kaomojiHandler("all");
            } else if (this.KaomojiMenuObject.menu.style.display !== "none") {
                this.KaomojiMenuObject.menu.style.display = "none";
                this.KaomojiShouldShow = false;
            }
        });
        if (!this.isKaomojiMenuCloseEventListenerAdded) {
            document.addEventListener("click", (event) => {
                const target = event.target as HTMLElement; // 将事件目标转换为 HTMLElement 类型
                if (
                    !target.closest("#kaomoji-menu") &&
                    !target.closest("#kaomoji-button") &&
                    this.KaomojiMenuObject.menu &&
                    this.KaomojiShouldShow
                ) {
                    this.KaomojiMenuObject.menu!.style.display = "none";
                    this.KaomojiShouldShow = false;
                }
            });
            this.isKaomojiMenuCloseEventListenerAdded = true;
        }
        button.innerHTML = ":)";

        this.ResizeKaomojiButton();
        this.KaomojiButton = button;
        document.body.appendChild(button);
        return button;
    }

    /**
     * 调整按钮位置
     */
    private static ResizeKaomojiButton() {
        if (this.InputElement && this.KaomojiButton) {
            const InputRect = this.InputElement.getBoundingClientRect();

            this.KaomojiButton.style.top =
                parseInt(InputRect.top) - window.innerHeight * 0.026 + "px";
            this.KaomojiButton.style.left =
                parseInt(InputRect.left) - window.innerHeight * 0.026 + "px";
        }
    }
    /**
     * 获取表情菜单
     * @param key 要获取表情菜单的索引
     * @returns 表情菜单的元素
     */
    private static getKaomojiMenu(key: string): HTMLDivElement {
        // 获取表情菜单 如果不存在则创建
        const {
            kaomojiContainer,
            menu,
        }: { kaomojiContainer: HTMLDivElement; menu: HTMLDivElement } = this
            .KaomojiMenuObject.menu
            ? {
                  kaomojiContainer: this.KaomojiMenuObject.container!,
                  menu: this.KaomojiMenuObject.menu!,
              }
            : ChatroomModule.buildKaomojiMenu();

        // 设置表情菜单内容
        this.selectKaomojiTitle(kaomojiContainer, key);
        return menu;
    }

    /**
     * 点击表情元素后的事件处理
     * &gt;>   &lt;<
     */
    private static kaomojiClick(
        event: MouseEvent,
        kaomojiElement: HTMLDivElement
    ): void {
        if (event.button === 0) {
            // 左键点击 将表情插入到输入框当前光标位置，如果不在焦点则插入到末尾

            if (this.InputElement) {
                // 获取光标位置
                const cursorPosition = this.InputElement.selectionStart;
                if (cursorPosition === null || cursorPosition == -1) {
                    this.InputElement.value += kaomojiElement.textContent;
                } else {
                    // 插入字符串
                    const value = this.InputElement.value;
                    const newValue =
                        value.substring(0, cursorPosition) +
                        kaomojiElement.textContent +
                        value.substring(cursorPosition);
                    this.InputElement.value = newValue;
                    // 将光标位置移到插入字符串后面
                    const newCursorPosition =
                        cursorPosition +
                        (kaomojiElement.textContent == null
                            ? 0
                            : kaomojiElement.textContent.length);
                    this.InputElement.setSelectionRange(
                        newCursorPosition,
                        newCursorPosition
                    );
                }
            }
        } else if (event.button === 2) {
            // 右键点击直接使用*消息发送表情
            SendEmote(kaomojiElement.textContent);
        } else if (event.button === 1) {
            // 中键点击直接发送表情
            SendChat(kaomojiElement.textContent);
        }
    }

    /**
     * 构建表情菜单 并填充内容
     * @returns 表情菜单的div元素包含菜单和菜单内表情容器元素
     */
    private static buildKaomojiMenu() {
        // 创建表情菜单的div元素
        const menu: HTMLDivElement = document.createElement("div");
        menu.id = "kaomoji-menu";
        menu.style.display = "flex"; //

        // 创建表情菜单标题的div元素
        const menuTitle: HTMLDivElement = document.createElement("div");
        // 创建表情菜单选择标题元素
        const menuTitleTextSet: { [key: string]: HTMLDivElement } =
            this.menuTitleTextSet;

        // 创建表情菜单标题关闭按钮的div元素
        const menuTitleClose: HTMLButtonElement =
            document.createElement("button");
        menuTitleClose.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="red" />
        </svg>`;

        // 创建表情容器的div元素
        const kaomojiContainer: HTMLDivElement = document.createElement("div");

        // 将表情菜单标题、表情容器添加到表情菜单div元素中  关闭按钮的添加在选择菜单添加之后
        menu.appendChild(menuTitle);
        menu.appendChild(kaomojiContainer);

        // 设置除菜单按钮之外的其他元素的类名
        menu.className = "kaomoji-menu";
        menuTitle.className = "kaomoji-title";
        menuTitleClose.className = "kaomoji-title-close";
        kaomojiContainer.className = "kaomoji-container";

        // 监听表情菜单标题关闭按钮的点击事件，点击时隐藏表情菜单
        menuTitleClose.addEventListener("click", () => {
            menu.style.display = "none";
            this.KaomojiShouldShow = false;
        });

        // 处理表情选择菜单
        for (const key in menuTitleTextSet) {
            /** 获取菜单标题元素的索引key key为中文菜单的字符串在这里{@link menuTitleTextSet} */

            // 赋值菜单选择按钮的内容
            menuTitleTextSet[key].innerHTML = L.get(
                "Chatroom",
                `KaomojiTitle.${key}` as strKey<"Chatroom">
            );
            // 类名
            menuTitleTextSet[key].className = "kaomoji-title-text";
            // 添加到菜单标题元素中
            menuTitle.appendChild(menuTitleTextSet[key]);

            // 为按钮添加点击事件
            menuTitleTextSet[key].addEventListener("click", () => {
                this.selectKaomojiTitle(kaomojiContainer, key);
            });
        }

        // 添加关闭按钮
        menuTitle.appendChild(menuTitleClose);

        // 将表情菜单标题、表情容器和表情菜单对象保存到静态属性中
        this.KaomojiMenuObject = {
            title: menuTitle,
            container: kaomojiContainer,
            menu: menu,
        };

        document.body.appendChild(menu);
        // 返回表情菜单标题、表情容器和表情菜单对象
        return { kaomojiContainer, menu };
    }

    /**
     * 将菜单的样式设置成当前选择的样式
     * @param selectKey 表情库的key
     */
    private static selectMenuTitleStyleHandle(selectKey: string) {
        const _className = "kaomoji-title-text-active";
        if (!this.menuTitleTextSet[selectKey].classList.contains(_className)) {
            this.menuTitleTextSet[selectKey].classList.add(_className);
        }
        for (const key2 in this.menuTitleTextSet) {
            if (key2 != selectKey) {
                this.menuTitleTextSet[key2].classList.remove(
                    "kaomoji-title-text-active"
                );
            }
        }
    }

    // /**
    //  * 将中文key变为表情库的key
    //  * @param key 将中文key变为表情库的key
    //  * @returns 返回表情库key
    //  */
    // private static getKaomojiSelectKey(key: string): string {
    //     /** 获取选择的key 这里的处理只是为了让中文的key变为表情库的key */
    //     let selectKey: string | null = null;
    //     switch (key) {
    //         case '开心':
    //             selectKey = 'hp';
    //             break;
    //         case '难过':
    //             selectKey = 'sd';
    //             break;
    //         case '害羞':
    //             selectKey = 'sy';
    //             break;
    //         case '生气':
    //             selectKey = 'ar';
    //             break;
    //         case '惊讶':
    //             selectKey = 'sp';
    //             break;
    //         case '困惑':
    //             selectKey = 'cf';
    //             break;
    //         case '搞怪':
    //             selectKey = 'nt';
    //             break;
    //         default:
    //             selectKey = 'all';
    //             break;
    //     }
    //     return selectKey;
    // }

    /**
     * 选择标题按钮时触发的方法
     * @param kaomojiContainer 容纳表情的容器元素
     * @param key 要显示表情库索引键 英文
     */
    private static selectKaomojiTitle(
        kaomojiContainer: HTMLDivElement,
        key: string
    ): void {
        const kaomojiList: string[] =
            key == "all" ? this.getAllKaomoji() : this.kaomojiSet[key];
        // 设置表情菜单内容
        kaomojiContainer.innerHTML = "";
        const kaomojiClassName = "kaomoji";
        this.selectMenuTitleStyleHandle(key);

        for (const kaomoji of kaomojiList) {
            const kaomojiElement: HTMLDivElement =
                document.createElement("div");
            kaomojiElement.className = kaomojiClassName;
            kaomojiElement.innerText = kaomoji;
            if (key !== "help") {
                kaomojiElement.addEventListener("click", (event) => {
                    this.kaomojiClick(event, kaomojiElement);
                });
                // 阻断该元素的右键点击和中间点击事件
                kaomojiElement.addEventListener("contextmenu", (event) => {
                    event.preventDefault();
                    this.kaomojiClick(event, kaomojiElement);
                });
                kaomojiElement.addEventListener("mousedown", (event) => {
                    if (event.button === 1) {
                        event.preventDefault();
                        this.kaomojiClick(event, kaomojiElement);
                    }
                });
            }
            kaomojiContainer.appendChild(kaomojiElement);
        }
    }

    /**
     * 移除表情菜单
     */
    private static removeKaomojiMenu() {
        if (this.KaomojiButton) {
            this.KaomojiButton.remove();
            this.KaomojiButton = null;
        }
        if (this.KaomojiMenuObject.menu) {
            this.KaomojiMenuObject.menu.remove();
            this.KaomojiMenuObject = {
                menu: null,
                title: null,
                container: null,
            };
        }
    }

    /**
     * 隐藏表情菜单
     */
    private static hideKaomojiMenu() {
        if (this.KaomojiMenuObject.menu) {
            this.KaomojiMenuObject.menu.style.display = "none";
        }
        if (this.KaomojiButton) {
            this.KaomojiButton.style.display = "none";
        }
    }

    /**
     * 显示表情菜单
     */
    private static showKaomojiMenu() {
        if (this.KaomojiMenuObject.menu && this.KaomojiShouldShow == true) {
            this.KaomojiMenuObject.menu.style.display = "flex";
        }
        if (this.KaomojiButton) {
            this.KaomojiButton.style.display = "inline";
        }
    }

    /**
     * 返回全部的表情
     * @returns 全部的表情列表
     */
    private static getAllKaomoji(): string[] {
        const allKaomojiList: string[] = [];
        for (const key in this.kaomojiSet) {
            if (key == "help") continue;
            for (const kaomoji of this.kaomojiSet[key]) {
                allKaomojiList.push(kaomoji);
            }
        }
        return allKaomojiList;
    }

    // VV Emoji相关方法 VV //
    private static EmojiMenu: HTMLDivElement | null = null;
    private static Emoji: Emoji | null = null;
    private static emojiWorker: Worker | null = null;

    private static getEmojiMenu(): HTMLDivElement {
        if (this.EmojiMenu) return this.EmojiMenu;

        const EmojiMenu: HTMLDivElement = document.createElement("div");
        EmojiMenu.className = "emoji-menu";

        this.EmojiMenu = EmojiMenu;
        return EmojiMenu;
    }

    private static getEmojiWorker(): Worker {
        if (this.emojiWorker) return this.emojiWorker;

        const emojiWorker: Worker = new Worker(EmojiWorkerRef);
        this.emojiWorker = emojiWorker;
        return emojiWorker;
    }

    private static displayEmojiMenu() {
        const EmojiMenu: HTMLDivElement = this.getEmojiMenu();
        EmojiMenu.style.display = "flex";
    }
    private static hideEmojiMenu() {
        const EmojiMenu: HTMLDivElement = this.getEmojiMenu();
        EmojiMenu.style.display = "none";
    }

    private static inputHandle(event: Event) {
        const value: string = (event.target as HTMLInputElement).value;

        // `: [EmojiKey]` 触发emoji菜单弹出
        const match = value.match(/:\/(.+)/);
        if (match) {
            this.displayEmojiMenu();

            this.EmojiMenu!.innerHTML = "";
            const w = this.getEmojiWorker();
            w.postMessage(match[1]);
            w.addEventListener("message", (e) => {
                const data = e.data as string[];

                for (const emoji of data) {
                    const emojiElement: HTMLDivElement =
                        document.createElement("div");
                    emojiElement.className = "emoji";
                    emojiElement.innerText = emoji;
                    emojiElement.addEventListener("click", (event) => {
                        this.emojiClick(event, emojiElement);
                    });
                    this.EmojiMenu!.appendChild(emojiElement);
                }
            });
        } else {
            this.hideEmojiMenu();
        }
    }
    private static emojiClick(event: Event, emojiElement: HTMLDivElement) {
        SendLocalMessage(`${emojiElement.innerText}`);
    }
}
