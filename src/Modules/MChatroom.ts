import { conDebug, hookFunction, segmentForCH, MSGType, copyAndDownloadHtmlElement, timeRange, SendActivity, SendChat } from "utils";
import { BaseModule } from "Modules/BaseModule";

const buildKaomojiMenuCSShref = DEBUG ? "https://iceriny.github.io/XiaoSuActivity/dev/kaomojiMenu.css" : "https://iceriny.github.io/XiaoSuActivity/main/kaomojiMenu.css";
export class ChatroomModule extends BaseModule {

    public Load(): void {
        this.hookListHandler();

        this.Loaded = true;
    }
    public Init(): void {
        this.moduleName = "ChatroomModule";
        this.priority = 30;

        const linkElement = document.createElement("link");
        linkElement.rel = "stylesheet";
        linkElement.type = "text/css";
        linkElement.href = buildKaomojiMenuCSShref;

        // 将 link 元素插入到 head 标签中
        document.head.appendChild(linkElement);
    }

    hookListHandler(): void {
        // hookFunction("ChatRoomSync", 30, (args, next) => {
        //     return next(args);
        // });

        hookFunction("CommandParse", 0,
            (args, next) => {
                let msg: string = args[0];
                // 匹配`开头的命令
                const match = msg.match(/^`([1-9])?(m)?( )? (.*)/);
                if (match) {
                    msg = match[2] != "m" ? this.stammerHandler(match[4], parseInt(match[1]), match[3] ? false : true, false) :
                        this.stammerHandler(match[4], parseInt(match[1]), match[3] ? false : true, true);
                }

                // 匹配[ | + 空格 ]的颜文字命令
                const kaomojiMatch = msg.match(/^\|(.*)/);
                if (kaomojiMatch) {
                    if (Object.keys(ChatroomModule.kaomojiSet).includes(kaomojiMatch[1])) {
                        ChatroomModule.kaomojiHandler(kaomojiMatch[1]);
                        const inputElement: HTMLInputElement = document.getElementById('InputChat') as HTMLInputElement;
                        inputElement.value = "";
                    } else {
                        ChatRoomSendLocal("该颜文字表情包不存在，请重新输入或输入 |help 查看参数", 5000)
                        const inputElement: HTMLInputElement = document.getElementById('InputChat') as HTMLInputElement;
                        inputElement.value = "|";
                    }
                    return;
                }

                args[0] = msg;
                return next(args);
            });
    }


    ExportChat(time_limit: timeRange | null = null): void {
        const exportName: string | undefined = `${ChatRoomData?.Name}_${new Date().toLocaleString()}`;

        const mainElement: HTMLElement | null = document.getElementById('TextAreaChatLog')

        copyAndDownloadHtmlElement(mainElement, exportName, time_limit)
    }

    /**
     * 
     * @param content 将要处理的句子内容
     * @param tenfoldStammeringProbability 结巴程度 [1 - 9]
     * @param isSegmentForCH 是否使用中文分词效果
     * @param haveMoan 是否呻吟
     * @returns 最终处理后的句子
     */
    stammerHandler(content: string, tenfoldStammeringProbability: number, isSegmentForCH: boolean, haveMoan: boolean): string {
        conDebug(`stammerHandler: content: ${content} tenfoldStammeringProbability: ${tenfoldStammeringProbability}`)

        // 处理结巴程度，默认结巴程度为5
        if (Number.isNaN(tenfoldStammeringProbability)) tenfoldStammeringProbability = 3;
        const stammeringProbability = tenfoldStammeringProbability / 10;

        // 使用segmentForCH进行分词，传入参数取消掉空白字符
        const segmentList = isSegmentForCH ? segmentForCH(content.replace(/\s/g, "")) : undefined;

        // 如果segmentForCH没有返回内容，则使用源字符串通过空格分词
        const stringArray: string[] = segmentList ? segmentList : content.split(' ');

        return this.stammerForList(stringArray, stammeringProbability, haveMoan);
    }

    moan: string[] = [
        " 嗯~❤..",
        " 昂~❤哈啊..",
        " --唔~呜..",
        " 姆嗯~❤...",
        " --嘶-啊~",
        " 唔..❤啊~",
        " --❤嘶哈~",
        " ❤呀~",
        " ❤...呀嗯..",
        " ❤.哦~嗯~."
    ];
    /**
     * 将分词后的句子添加效果并返回完整句子.
     * @param messageList 经过分词后的字符串列表
     * @param stammeringProbability 结巴程度 [0.1~0.9]
     * @param haveMoan 是否呻吟
     * @returns 返回处理后的完整句子.
     */
    private stammerForList(messageList: string[], stammeringProbability: number, haveMoan: boolean): string {
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
            };

            // 根据当前玩家的兴奋程度决定是否添加呻吟
            if (haveMoan && Player.ArousalSettings?.Progress && 100 * Math.random() <= Player.ArousalSettings?.Progress) {
                result += this.moan[Math.floor(Math.random() * this.moan.length)];
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


    private static kaomojiHandler(message: string): void {
        const kaomojiMenu = this.buildKaomojiMenu(message);
        if (kaomojiMenu) {
            const textAreaChatLog = document.getElementById('TextAreaChatLog')
            textAreaChatLog?.appendChild(kaomojiMenu);
            setTimeout(() => {
                kaomojiMenu.remove();
            }, 10000);
        }
    }
    private static kaomojiSet: { [groupName: string]: string[] } = {
        help: ["all ==> 全部表情", "hp ==> 开心", "sd ==> 伤心", "sy ==> 害羞", "ar ==> 生气", "ap ==> 惊讶", "cf ==> 困惑", "nt ==> 搞怪顽皮"],
        hp: ["(￣w￣)ノ", "(≧∇≦)ﾉ", "o(^▽^)o", "(￣︶￣)↗", "o(*￣▽￣*)o", "(p≧w≦q)", "ㄟ(≧◇≦)ㄏ", "(/≧▽≦)/", "(　ﾟ∀ﾟ) ﾉ♡",
            "o(*￣︶￣*)o", "(๑¯∀¯๑)", "(≧∀≦)ゞ", "φ(≧ω≦*)♪", "╰(*°▽°*)╯", "(*^▽^*)", "(๑•̀ㅂ•́)و✧", "(o゜▽゜)o☆[BINGO!]", "(^▽^ )", "<(*￣▽￣*)/", "┌|*´∀｀|┘", "♪(´∇`*)"],
        sd: ["テ_デ", "□_□", "┭┮﹏┭┮", "╥﹏╥...", "o(TヘTo)", "〒▽〒", "ε(┬┬﹏┬┬)3", "(;´༎ຶД༎ຶ`)", "(ノへ`、)", "（-_-。）", "(ノへ￣、)"],
        sy: ["|ω・）", "|･ω･｀)", "◕ฺ‿◕ฺ✿ฺ)", "つ﹏⊂", "(* /ω＼*)", "o(*////▽////*)q", "(*/ω＼*)", "(′▽`〃)", "(✿◡‿◡)", "(/▽＼)", "(๑´ㅂ`๑)", "(◡ᴗ◡✿)"],
        ar: ["(σ｀д′)σ", "＼(゜ロ＼)(／ロ゜)／", "<(－︿－)>", "(ー`´ー)", "（｀へ´）", "(-__-)=@))> o<)", "(///￣皿￣)○～", "┻━┻︵╰(‵□′)╯︵┻━┻", "→)╥﹏╥)", "抽!!(￣ε(#￣)☆╰╮(￣▽￣///)", "(￣ε(#￣)☆╰╮o(￣皿￣///)",
            "(* ￣︿￣)", "（＃￣～￣＃）", "(⊙x⊙;)", "o(*≧▽≦)ツ┏━┓", "(ノω<。)ノ))☆.。", "(〃＞目＜)", "( σ'ω')σ", "o(′益`)o", "(〃＞目＜)", "o(≧口≦)o", "Ｏ(≧口≦)Ｏ", "...(*￣０￣)ノ[等等我…]", "（≧0≦）"],
        sp: ["’(°ー°〃)", "(ーー゛)", "(○´･д･)ﾉ", "wow~ ⊙o⊙", "~(￣0￣)/", "Σ(｀д′*ノ)ノ", "Σ(っ °Д °;)っ", "(⊙ˍ⊙)", "w(ﾟДﾟ)w", "ｍ(o・ω・o)ｍ", "⊙▽⊙"],
        cf: ["( -'`-)", "(=′ー`)", "( -'`-; )", "(・-・*)", "( ｀д′)", "(￣m￣）", "( ╯▽╰)"],
        nt: ["(ˉ▽￣～) 切~~", "(￣w￣)ノ", "( ￣ー￣)", "(‾◡◝)", "(￣_,￣ )", "( ﹁ ﹁ ) ~→", "<(￣ ﹌ ￣)@m"]
    }
    private static buildKaomojiMenu(key: string): HTMLDivElement | undefined {
        const kaomojiList: string[] = key == "all" ? Object.values(this.kaomojiSet).flatMap((v) => v) : this.kaomojiSet[key]
        if (kaomojiList.length > 0) {
            const menu: HTMLDivElement = document.createElement('div');
            const menuTitle: HTMLDivElement = document.createElement('div');
            const kaomojiContainer: HTMLDivElement = document.createElement('div');

            const kaomojiClassName: string = 'kaomoji';

            menu.appendChild(menuTitle);
            menu.appendChild(kaomojiContainer);

            menu.className = 'kaomoji-menu';
            kaomojiContainer.className = 'kaomoji-container';

            menuTitle.innerText = key;

            for (const kaomoji of kaomojiList) {
                const kaomojiElement: HTMLDivElement = document.createElement('div');
                kaomojiElement.className = kaomojiClassName;
                kaomojiElement.innerText = kaomoji;
                if (key !== "help") {
                    kaomojiElement.addEventListener('click', () => {
                        SendChat(kaomojiElement.innerHTML)
                    });
                }
                kaomojiContainer.appendChild(kaomojiElement);
            }

            return menu;
        } else return undefined;
    }
}