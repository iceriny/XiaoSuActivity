import { conDebug, hookFunction, segmentForCH, MSGType, copyAndDownloadHtmlElement, timeRange, SendEmote, SendChat } from "utils";
import { BaseModule } from "Modules/BaseModule";

const buildKaomojiMenuCSShref = DEBUG ? "https://iceriny.github.io/XiaoSuActivity/dev/XSActivityStyle.css" : "https://iceriny.github.io/XiaoSuActivity/main/XSActivityStyle.css";
export class ChatroomModule extends BaseModule {

    // VVVV==========初始化与加载函数==========VVVV //
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


    static InputElement: HTMLInputElement | null = null;

    /**
     * hook函数列表处理
     */
    hookListHandler(): void {
        // hookFunction("ChatRoomSync", this.priority, (args, next) => {
        //     return next(args);
        // });

        hookFunction("ChatRoomLoad", this.priority, (args, next) => {
            const result = next(args);
            if (!ChatroomModule.InputElement) {
                ChatroomModule.InputElement = document.getElementById('InputChat') as HTMLInputElement;
            }
            ChatroomModule.buildKaomojiButton()

            return result;
        });

        hookFunction("ChatRoomResize", this.priority, (args, next) => {//
            ChatroomModule.ResizeKaomojiButton();
            return next(args);
        });

        hookFunction("ChatRoomClearAllElements", this.priority, (args, next) => {
            ChatroomModule.removeKaomojiMenu();
            ChatroomModule.InputElement = null;
            return next(args);
        });

        hookFunction("ChatRoomShowElements", this.priority, (args, next) => {
            const result = next(args);
            ChatroomModule.showKaomojiMenu();
            return result;
        });
        hookFunction("ChatRoomHideElements", this.priority, (args, next) => {
            const result = next(args);
            ChatroomModule.hideKaomojiMenu();
            return result;
        });

        hookFunction("CommandParse", 0,
            (args, next) => {
                let msg: string = args[0];
                // 匹配`开头的命令
                const match = msg.match(/^`([1-9])?(m)?( )? (.*)/);
                if (match) {
                    msg = match[2] != "m" ? this.stammerHandler(match[4], parseInt(match[1]), match[3] ? false : true, false) :
                        this.stammerHandler(match[4], parseInt(match[1]), match[3] ? false : true, true);
                }

                // 匹配[ | ]的颜文字命令
                const kaomojiMatch = msg.match(/^\|(.*)/);
                if (kaomojiMatch) {
                    if (Object.keys(ChatroomModule.kaomojiSet).includes(kaomojiMatch[1]) || kaomojiMatch[1] == "all") {
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


    // VVVV==========聊天记录模块==========VVVV //
    /**
     * 导出聊天记录
     * @param time_limit 时间范围
     */
    ExportChat(time_limit: timeRange | null = null): void {
        const exportName: string | undefined = `${ChatRoomData?.Name}_${new Date().toLocaleString()}`;

        const mainElement: HTMLElement | null = document.getElementById('TextAreaChatLog')

        copyAndDownloadHtmlElement(mainElement, exportName, time_limit)
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

    /** 呻吟词库 */
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

    // VVVV==========颜文字表情模块==========VVVV //

    /** 表情菜单对象 */
    static KaomojiMenuObject: {
        menu: HTMLDivElement | null,
        title: HTMLDivElement | null,
        container: HTMLDivElement | null,
    } = {
            menu: null,
            title: null,
            container: null,
        };

    static KaomojiButton: HTMLButtonElement | null = null;

    /**
     * 处理颜文字表情系统
     * @param message 传入的信息，一般是命令
     */
    private static kaomojiHandler(message: string): void {
        const kaomojiMenu = this.getKaomojiMenu(message);
        if (kaomojiMenu) {
            // const textAreaChatLog = document.getElementById('TextAreaChatLog')
            kaomojiMenu.style.display = "flex";
            // setTimeout(() => {
            //     kaomojiMenu.style.display = "none";
            // }, 30000);
        }
    }

    /** 表情库 */
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
    /** 
     *  (￣w￣)ノ(￣v￣)ノ(￣l￣)ノ ψ(*｀ー´)ψ  ψ(￣皿￣)ノ
     */
    /** 
     * （இ௰இ）(｡◕ฺˇε ˇ◕ฺ｡） !!!∑(ﾟДﾟノ)ノ  ✌︎( ᐛ )✌︎  o-o(=•ェ•=)m  <(￣︶￣)↗[GO!]   ｡◔‸◔｡   ˃ʍ˂  ヾ(ノ' ﹃' )ノ
     ꉂ-ꉂ(ˊᗜˋ*)  (●°u°●)​ 」，(｀・ω・´）(●'◡'●) ，(*・ω・)ﾉ， ༼ つ ◕_◕ ༽つ，(๑•̀ㅂ•́)و✧*，(੭*ˊᵕˋ)੭*ଘ*，ヽ(✿ﾟ▽ﾟ)ノ (°ー°〃)  ，  (⊙﹏⊙)，   Σ( ° △ °|||)︴，ヾ(￣▽￣)Bye~Bye~，(⊙ˍ⊙)，|･ω･｀)，⚆_⚆，(´▽｀)
    ⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄，(●—●)， (｡･∀･)ﾉﾞ，/ᐠ｡ꞈ｡ᐟ\，┬─┬ ノ('-'ノ)， ┸━━┸)>口<)，(-.-)..zzZZ，( ᗜ ˰ ᗜ ) ,(〃'▽'〃)
    ꒰ ˶• ༝ •˶꒱，(\   (\ („• ֊ •„)*，*(\   (\ฅ(• - •)ฅ*，ฅ( ̳• ◡ • ̳)ฅ。(¦3[▓▓],,Hi~ o(*￣▽￣*)ブ，(๑˙ー˙๑)，，（｡ò ∀ ó｡）
    (｡･ω･｡)ﾉ♡，(｡◝ᴗ◜｡)，ψ(｀∇´)ψ，(ง ˙o˙)ว，(◍ ´꒳` ◍)，(๑╹ヮ╹๑)ﾉ，(๑•̀ω•́)ノ，(∠・ω< )⌒★
    ヾ(❀╹◡╹)ﾉ~， (๑>؂<๑）1(◎｀・ω・´)人(´・ω・｀*)   =͟͟͞͞(꒪ᗜ꒪ ‧̣̥̇)  (˵¯͒〰¯͒˵)  ✧∇✧   (◉ω◉υ)⁼³₌₃   | ᐕ)⁾⁾
     */


    private static buildKaomojiButton(): HTMLButtonElement {
        if (this.KaomojiButton) return this.KaomojiButton;
        const button = document.createElement("button");
        button.className = "kaomoji-button";
        button.addEventListener("click", () => {
            if (!this.KaomojiMenuObject.menu || this.KaomojiMenuObject.menu.style.display === "none"){
                this.kaomojiHandler('all');
            } else if (this.KaomojiMenuObject.menu.style.display !== "none"){
                this.KaomojiMenuObject.menu.style.display = "none";
            }
        });
        button.innerHTML = ":)";

        this.ResizeKaomojiButton();
        this.KaomojiButton = button;
        document.body.appendChild(button);
        return button;
    }

    private static ResizeKaomojiButton(){
        if (this.InputElement && this.KaomojiButton) {
            this.KaomojiButton.style.top = this.InputElement.offsetTop + this.InputElement.offsetHeight + 10 + "px";
            this.KaomojiButton.style.left = this.InputElement.offsetLeft + "px";
        }
    }
    /**
     * 获取表情菜单
     * @param key 要获取表情菜单的索引
     * @returns 表情菜单的元素
     */
    private static getKaomojiMenu(key: string): HTMLDivElement | undefined {
        // 获取表情菜单 如果不存在则创建
        const { kaomojiContainer, menu }
            : {kaomojiContainer: HTMLDivElement; menu: HTMLDivElement; }
            = this.KaomojiMenuObject.menu
                ? {kaomojiContainer: this.KaomojiMenuObject.container!, menu: this.KaomojiMenuObject.menu! }
                : ChatroomModule.buildKaomojiMenu();

        // 设置表情菜单内容
        this.selectKaomojiTitle(kaomojiContainer, key);
        return menu;
    }

    /**
     * 点击表情元素后的事件处理
     */
    private static kaomojiClick(event: MouseEvent, element: HTMLDivElement): void {
        if (event.button === 0) { // 左键点击 将表情插入到输入框当前光标位置，如果不在焦点则插入到末尾

            if (this.InputElement) {
                // 获取光标位置
                const cursorPosition = this.InputElement.selectionStart;
                if (cursorPosition === null || cursorPosition == -1) {
                    this.InputElement.value += element.innerHTML;
                } else {
                    // 插入字符串
                    var value = this.InputElement.value;
                    var newValue = value.substring(0, cursorPosition) + element.innerHTML + value.substring(cursorPosition);
                    this.InputElement.value = newValue;
                    // 将光标位置移到插入字符串后面
                    var newCursorPosition = cursorPosition + element.innerHTML.length;
                    this.InputElement.setSelectionRange(newCursorPosition, newCursorPosition);
                }
            }
        } else if (event.button === 2) { // 右键点击直接使用*消息发送表情
            SendEmote(element.innerHTML);
        } else if (event.button === 1) { // 中键点击直接发送表情
            SendChat(element.innerHTML);
        }
    }


    /**
     * 构建全新的无内容表情菜单
     * @returns 全新的无内容表情菜单
     */
    private static buildKaomojiMenu() {
        // 创建表情菜单的div元素
        const menu: HTMLDivElement = document.createElement('div');
        menu.style.display = 'flex';//

        // 创建表情菜单标题的div元素
        const menuTitle: HTMLDivElement = document.createElement('div');
        // 创建表情菜单选择标题元素
        const menuTitleTextSet: { [key: string]: HTMLDivElement } = {
            全部: document.createElement('div'),
            开心: document.createElement('div'),
            难过: document.createElement('div'),
            害羞: document.createElement('div'),
            生气: document.createElement('div'),
            惊讶: document.createElement('div'),
            困惑: document.createElement('div'),
            搞怪: document.createElement('div')
        }


        // 创建表情菜单标题关闭按钮的div元素
        const menuTitleClose: HTMLDivElement = document.createElement('div');

        // 创建表情容器的div元素
        const kaomojiContainer: HTMLDivElement = document.createElement('div');

        // 将表情菜单标题、表情容器和表情菜单添加到表情菜单div元素中
        menu.appendChild(menuTitle);
        menu.appendChild(kaomojiContainer);
        menuTitle.appendChild(menuTitleClose);
        menuTitleClose.innerHTML = "🔴";

        // 设置表情菜单和表情菜单标题的类名
        menu.className = 'kaomoji-menu';
        menuTitle.className = 'kaomoji-title';
        menuTitleClose.className = 'kaomoji-title-close';
        kaomojiContainer.className = 'kaomoji-container';

        // 监听表情菜单标题关闭按钮的点击事件，点击时移除表情菜单
        menuTitleClose.addEventListener('click', () => {
            menu.style.display = 'none';
        });

        // 处理表情选择菜单
        for (const key in menuTitleTextSet) {
            menuTitleTextSet[key].innerHTML = key;
            menuTitleTextSet[key].className = 'kaomoji-title-text';
            menuTitle.appendChild(menuTitleTextSet[key]);
            menuTitleTextSet[key].addEventListener('click', () => {
                menuTitleTextSet[key].classList.toggle('kaomoji-title-text-active');
                for (const key2 in menuTitleTextSet) {
                    if (key2 != key) {
                        menuTitleTextSet[key2].classList.remove('kaomoji-title-text-active');
                    }
                }
                let selectKey: string | null = null;
                switch (key) {
                    case '开心':
                        selectKey = 'hp';
                        break;
                    case '难过':
                        selectKey = 'sd';
                        break;
                    case '害羞':
                        selectKey = 'sy';
                        break;
                    case '生气':
                        selectKey = 'ar';
                        break;
                    case '惊讶':
                        selectKey = 'sp';
                        break;
                    case '困惑':
                        selectKey = 'cf';
                        break;
                    case '搞怪':
                        selectKey = 'nt';
                        break;
                    default:
                        selectKey = 'all';
                        break;
                }
                this.selectKaomojiTitle(kaomojiContainer, selectKey)

            })
        }

        // 将表情菜单标题、表情容器和表情菜单对象保存到静态属性中
        this.KaomojiMenuObject = { title: menuTitle, container: kaomojiContainer, menu: menu };

        document.body.appendChild(menu);
        // 返回表情菜单标题、表情容器和表情菜单对象
        return {kaomojiContainer, menu };
    }

    /**
     * 选择标题按钮时触发的方法
     * @param kaomojiContainer 容纳表情的容器元素
     * @param key 要显示表情的索引键
     */
    private static selectKaomojiTitle(kaomojiContainer: HTMLDivElement, key: string): void {
        const kaomojiList: string[] = key == "all" ? this.getAllKaomoji() : this.kaomojiSet[key]
        // 设置表情菜单内容
        kaomojiContainer.innerHTML = '';
        const kaomojiClassName = 'kaomoji';

        for (const kaomoji of kaomojiList) {
            const kaomojiElement: HTMLDivElement = document.createElement('div');
            kaomojiElement.className = kaomojiClassName;
            kaomojiElement.innerText = kaomoji;
            if (key !== "help") {
                kaomojiElement.addEventListener('click', (event) => {
                    this.kaomojiClick(event, kaomojiElement);
                });
                // 阻断该元素的右键点击和中间点击事件
                kaomojiElement.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                    this.kaomojiClick(event, kaomojiElement);
                })
                kaomojiElement.addEventListener('mousedown', (event) => {
                    if (event.button === 1) {
                        event.preventDefault();
                        this.kaomojiClick(event, kaomojiElement);
                    }
                })
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
        if (this.KaomojiMenuObject.menu) {
            this.KaomojiMenuObject.menu.style.display = 'flex';
        }
        if (this.KaomojiButton) {
            this.KaomojiButton.style.display = '';

        }
    }

    /**
     * 返回全部的表情
     * @returns 全部的表情列表
     */
    private static getAllKaomoji():string[] {
        const allKaomojiList: string[] = [];
        for (const key in this.kaomojiSet){
            if (key == 'help') continue;
            for (const kaomoji of this.kaomojiSet[key]) {
                allKaomojiList.push(kaomoji);
            }
        }
        return allKaomojiList;
    }
}