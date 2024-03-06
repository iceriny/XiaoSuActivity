import { hookFunction } from "utils";
import { BaseModule } from "./BaseModule";


export class ChessModule extends BaseModule {
    public Load(): void {
        hookFunction("ChatRoomMessage", 10, (args, next) => {
            const data = args[0] as ServerChatRoomMessage;

            if (typeof data === 'object') {
                if (data.Content === 'XSA_Chess' && data.Dictionary) {
                    // 拦截XSA_Chess消息
                    const CheckerInfo = data.Dictionary[0] as ChessDictionaryEntry;
                    if (CheckerInfo.sender === Player.MemberNumber) return;
                    this.ShowChessboard(CheckerInfo, data.Sender ?? 0);
                    return;
                }
            }
            return next(args);
        })

        this.Loaded = true;
    }
    public Init(): void {
        this.priority = 0;
    }

    // 内存中的历史棋盘 当前版本有内存泄露的风险 回头再详细测试
    private static ChessDivMap: Map<number, HTMLDivElement> = new Map();

    /**
     * 获取相同两个人在历史棋盘中储存的内容的键
     * @param p1 玩家1编号
     * @param p2 玩家2编号
     * @returns 通过玩家编号获取的在历史棋盘中的键
     */
    private static getChessDivKey(p1: number, p2: number): number {
        const combinedString = `${p1}${p2}`; // 将两个数字拼接成一个字符串
        let hash = 0;
        for (let i = 0; i < combinedString.length; i++) {
            const char = combinedString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char; // 使用简单的哈希算法处理字符串
            hash |= 0; // 将结果转换为32位整数
        }
        return hash;
    }

    /**
     * 发送一个棋局信息到服务器
     * @param Player1 玩家1
     * @param Player2 玩家2
     * @param Round 回合数
     * @param checkerboard 棋盘信息 二维数组
     * @param started 是否已经开始对局
     */
    SendAChess(Player1: number, Player2: number | null, Round: number, checkerboard: Checkerboard = Chess.newCheckerboard, started: boolean = false) {
        const CheckerInfo: ChessDictionaryEntry = { Player1, Player2, Round: Round, Checkerboard: checkerboard, start: started, sender: Player.MemberNumber ?? -1 }
        //if (!Player2) this.ShowChessboard(CheckerInfo);
        ServerSend("ChatRoomChat", { Type: 'Hidden', Content: 'XSA_Chess', Dictionary: [CheckerInfo], Sender: Player.MemberNumber })
    }

    /**
     * 显示一个棋局
     * @param info 对局信息
     * @param sender 发送者
     */
    ShowChessboard(info: ChessDictionaryEntry, sender: number) {
        // 通过从服务器接受的信息new一个棋局类
        const chess = new Chess(info.Player1)
        // 载入信息
        chess.LoadInfo(info);

        // 仿照原版的发送本地信息函数的部分代码
        const div = document.createElement("div");
        const chessKey = ChessModule.getChessDivKey(chess.player1MemberNumber, chess.player2MemberNumber ?? -1);
        if (ChessModule.ChessDivMap.has(chessKey)) {
            ChessModule.ChessDivMap.get(chessKey)!.remove();
            ChessModule.ChessDivMap.delete(chessKey);
            ChessModule.ChessDivMap.set(chessKey, div);
        } else {
            ChessModule.ChessDivMap.set(chessKey, div);
        }

        div.setAttribute('class', 'ChatMessage ChatMessage' + 'LocalMessage');
        div.setAttribute('data-time', ChatRoomCurrentTime());
        div.setAttribute('data-sender', sender);

        // 通过chess类实例的Element属性(get())获取棋盘
        const main = chess.Element;

        // 如果对局没有开始 或者 当前玩家是 玩家1 (发起者) 或者是 玩家2 则添加按钮
        // 
        if (!info.start || chess.player1MemberNumber === Player.MemberNumber || chess.player2MemberNumber === Player.MemberNumber) {
            // 发送按钮
            const sendButton: HTMLButtonElement = document.createElement('button');
            sendButton.className = 'ChatMessageButton';

            sendButton.innerHTML = '发送';
            sendButton.addEventListener('click', () => {
                // 点击后禁用交互
                chess.Disable = true;
                // 如果对局开始 并且 玩家1 是操作者 则回合数加1 换句话说 因为发起者总是玩家1 所以发起者发送信息后回合数加1 等从服务器接受到信息再发送 则回合数+1
                if (info.start && info.Player1 === Player.MemberNumber) chess.Round++;
                // 如果对局没有开始 并且 当前玩家不是 玩家1 (不是发起者) 则对局开始 将当前玩家的编号传入 chess 类实例中
                if (!info.start && info.Player1 !== Player.MemberNumber) {
                    chess.player2MemberNumber = Player.MemberNumber ?? null;
                    info.start = true;
                }
                // 发送对局信息到服务器
                this.SendAChess(chess.player1MemberNumber, chess.player2MemberNumber, chess.Round, chess.checkerboard, info.start);
                // 发送后移除按钮
                sendButton.remove();
                // 30秒后移除div 防止内存泄露
                setTimeout(() => {
                    div.remove();
                }, 30000);
            })
            // 添加按钮
            main.appendChild(sendButton);
        }

        // 将棋盘添加到div中
        div.appendChild(main)
        // 添加到聊天框中
        ChatRoomAppendChat(div);
    }
}


export class Chess {
    /** 棋盘信息 */
    public checkerboard: Checkerboard;
    /** 玩家1编号 */
    public player1MemberNumber: number;
    /** 玩家1名称 */
    public player1Name: string;
    /** 玩家2编号 */
    public player2MemberNumber: number | null;
    /** 玩家2名称 */
    public player2Name: string;

    /** 回合数 */
    public Round: number;

    /** 表示是否可以对玩家1的棋子交互 */
    private canChange1: boolean;
    /** 表示是否可以对玩家2的棋子交互 */
    private canChange2: boolean;

    /** 表示是否可以对棋子交互 */
    public Disable: boolean;


    constructor(player1MemberNumber: number) {
        this.player1MemberNumber = player1MemberNumber;
        this.player1Name = this.getPlayer1Name()
        this.canChange1 = false;

        this.player2MemberNumber = null;
        this.player2Name = '未开始';
        this.canChange2 = false;

        this.checkerboard = Chess.newCheckerboard;
        this.Round = 0;

        this.Disable = false;
    }

    /**
     * 将棋局信息载入到类实例中
     * 因为在构造函数时玩家1的信息已经写入
     * 此处关于玩家的信息只需要更新玩家2的信息 和 当前玩家是否是参与玩家 (canChange1, canChange2)
     * @param info 棋局信息
     */
    public LoadInfo(info: ChessDictionaryEntry): void {
        this.player2MemberNumber = info.Player2;
        this.player2Name = this.getPlayer2Name();

        if (this.player1MemberNumber === Player.MemberNumber) {
            this.canChange1 = true;
            this.canChange2 = false;
        }
        else if (!this.player2MemberNumber || this.player2MemberNumber === Player.MemberNumber) {
            this.canChange1 = false;
            this.canChange2 = true;
        }

        this.Round = info.Round;
        this.checkerboard = info.Checkerboard;
    }

    /**
     * 在聊天室中寻找 player1 如果未找到则返回null
     * @returns 聊天室中的玩家1(如果存在)
     */
    private getPlayer1(): Character | null {
        return ChatRoomCharacter.find(c => c.MemberNumber == this.player1MemberNumber) ?? null;
    }
    /**
     * 搜索玩家1 并返回名称(昵称(优先)或名字)
     * @returns 玩家1的名称
     */
    private getPlayer1Name(): string {
        const P1 = this.getPlayer1();

        return P1 ? ((P1.Nickname === '' || !P1.Nickname) ? P1.Name : P1.Nickname) : '丢失'
    }
    /**
     * 在聊天室中寻找 player2 如果未找到则返回null
     * @returns 聊天室中的玩家2(如果存在)
     */
    private getPlayer2(): Character | null {
        if (this.player2MemberNumber === null) return null;
        return ChatRoomCharacter.find(c => c.MemberNumber == this.player2MemberNumber) ?? null;
    }
    /**
     * 搜索玩家2 并返回名称(昵称(优先)或名字)
     * @returns 玩家2的名称
     */
    private getPlayer2Name(): string {
        const P2 = this.getPlayer2();
        if (this.player2MemberNumber === null) return '未开始'
        return P2 ? ((P2.Nickname === '' || !P2.Nickname) ? P2.Name : P2.Nickname) : '丢失';
    }

    /** 获取一个新的棋盘数据结构 */
    public static get newCheckerboard(): Checkerboard {
        const result = [];
        for (let r = 1; r <= 19; r++) {
            const _row = [];
            for (let c = 1; c <= 19; c++) {
                _row.push(null);
            }
            result.push(_row);
        }
        return result as Checkerboard;
    }

    /** 通过类的实例数据生成一个在页面中显示的棋盘元素 (不会添加到页面中) */
    get Element(): HTMLDivElement {

        // 容器
        const main: HTMLDivElement = document.createElement('div');
        main.className = 'chessContainer';
        // 标题
        const title: HTMLDivElement = document.createElement('div');
        title.className = 'chessTitle';
        title.innerHTML = `|---玩家1: ${this.player1Name} 🆚 玩家2: ${this.player2Name}---|---回合: ${this.Round}---|`;
        main.appendChild(title);

        // 棋盘
        const checkerboard: HTMLTableElement = document.createElement('table');
        checkerboard.className = 'chessTable';


        let rowIndex = 0;
        let colIndex = 0;
        // 获取信息
        for (const row of this.checkerboard) {
            rowIndex++;
            colIndex = 0;
            // 生成一行
            const tableRow: HTMLTableRowElement = document.createElement('tr');
            // 通过遍历生成一行的列
            for (const i of row) {
                colIndex++;
                // 棋子
                const call: HTMLTableCellElement = document.createElement('td');
                call.className = 'chessCell';

                // 行和列的序号属性
                call.setAttribute('row', rowIndex.toString());
                call.setAttribute('col', colIndex.toString());

                // 值
                call.setAttribute('value', 0)
                // 如果true则为玩家1的棋子，false则为玩家2棋子
                if (i === true) {
                    call.setAttribute('value', 1);
                } else if (i === false) {
                    call.setAttribute('value', 2);
                }

                // 点击事件
                call.addEventListener('click', () => {
                    this.chessCallClick(call);
                });

                // 设置棋子颜色 玩家1为白色 2为黑色
                this.updateChessCallColor(call);
                // 添加到行中
                tableRow.appendChild(call);
            }
            // 添加到棋盘中
            checkerboard.appendChild(tableRow);
        }
        main.appendChild(checkerboard);
        return main;
    }

    /**
     * 处理点击棋子事件
     * @param call 代表棋子的单元格
     * @returns void
     */
    chessCallClick(call: HTMLTableCellElement): void {
        if (this.Disable) return;
        // 获取值
        const callValue = call.getAttribute('value');
        // 如果当前操作者是玩家1 
        if (this.canChange1) {
            // 如果当前值为0则设置为1(悔棋或修改)，否则设置为0
            if (callValue === '0') call.setAttribute('value', 1);
            if (callValue === '1') call.setAttribute('value', 0);
        }
        // 如果当前操作者是玩家2
        if (this.canChange2) {
            // 如果当前值为0则设置为1(悔棋或修改)，否则设置为0
            if (callValue === '0') call.setAttribute('value', 2);
            if (callValue === '2') call.setAttribute('value', 0);
        }
        // 设置棋子颜色 玩家1为白色 2为黑色
        this.updateChessCallColor(call);
        this.changeCheckerboard(parseInt(call.getAttribute('row')!), parseInt(call.getAttribute('col')!), parseInt(call.getAttribute('value')!) as (0 | 1 | 2));
    }

    /**
     * 根据棋子的值 更新棋子的颜色
     * @param call 代表棋子的单元格
     */
    private updateChessCallColor(call: HTMLTableCellElement) {
        switch (call.getAttribute('value')) {
            case '0':
                call.className = 'chessCell';
                break;
            case '1':
                call.className = 'chessCell chessCellWhite';
                break;
            case '2':
                call.className = 'chessCell chessCellBlack';
                break;
        }
    }

    /**
     * 改变对应位置棋子的值
     * @param rowIndex 行索引(1~19)
     * @param colIndex 列索引(1~19)
     * @param value 要写入的值
     */
    changeCheckerboard(rowIndex: number, colIndex: number, value: 0 | 1 | 2): void {
        switch (value) {
            case 0:
                this.checkerboard[rowIndex - 1][colIndex - 1] = null;
                break;
            case 1:
                this.checkerboard[rowIndex - 1][colIndex - 1] = true;
                break;
            case 2:
                this.checkerboard[rowIndex - 1][colIndex - 1] = false;
                break;
        }
    }
}