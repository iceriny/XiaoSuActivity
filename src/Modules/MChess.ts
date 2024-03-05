import { hookFunction } from "utils";
import { BaseModule } from "./BaseModule";


export class ChessModule extends BaseModule {
    public Load(): void {
        hookFunction("ChatRoomMessage", 10, (args, next) => {
            const data = args[0] as ServerChatRoomMessage;

            if (typeof data === 'object') {
                if (data.Content === 'XSA_Chess' && data.Dictionary) {
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

    private static ChessDivMap: Map<number, HTMLDivElement> = new Map();
    private static getChessDivKey(p1:number, p2:number):number{
        const combinedString = `${p1}${p2}`; // 将两个数字拼接成一个字符串
            let hash = 0;
            for (let i = 0; i < combinedString.length; i++) {
                const char = combinedString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char; // 使用简单的哈希算法处理字符串
                hash |= 0; // 将结果转换为32位整数
            }
            return hash;
    }

    SendAChess(Player1: number, Player2: number | null, Round: number, checkerboard: Checkerboard = Chess.newCheckerboard, started: boolean = false) {
        const CheckerInfo: ChessDictionaryEntry = { Player1, Player2, Round: Round, Checkerboard: checkerboard, start: started, sender: Player.MemberNumber ?? -1 }
        //if (!Player2) this.ShowChessboard(CheckerInfo);
        ServerSend("ChatRoomChat", { Type: 'Hidden', Content: 'XSA_Chess', Dictionary: [CheckerInfo], Sender: Player.MemberNumber })
    }


    ShowChessboard(info: ChessDictionaryEntry, sender: number) {
        const chess = new Chess(info.Player1)
        chess.LoadInfo(info);

        // Adds the message and scrolls down unless the user has scrolled up
        const div = document.createElement("div");
        const chessKey = ChessModule.getChessDivKey(chess.player1MemberNumber, chess.player2MemberNumber ?? -1);
        if (ChessModule.ChessDivMap.has(chessKey)){
            ChessModule.ChessDivMap.get(chessKey)!.remove();
            ChessModule.ChessDivMap.delete(chessKey);
            ChessModule.ChessDivMap.set(chessKey, div);
        } else {
            ChessModule.ChessDivMap.set(chessKey, div);
        }
        div.setAttribute('class', 'ChatMessage ChatMessage' + 'LocalMessage');
        div.setAttribute('data-time', ChatRoomCurrentTime());
        div.setAttribute('data-sender', sender);
        // 发送按钮
        const sendButton: HTMLButtonElement = document.createElement('button');
        sendButton.innerHTML = '发送';
        sendButton.addEventListener('click', () => {
            chess.Disable = true;
            if (info.start && info.Player1 === Player.MemberNumber) chess.Round++;
            if (!info.start && info.Player1 !== Player.MemberNumber) {
                chess.player2MemberNumber = Player.MemberNumber ?? null;
                info.start = true;
            }
            this.SendAChess(chess.player1MemberNumber, chess.player2MemberNumber, chess.Round, chess.checkerboard, info.start);
            sendButton.remove();
            setTimeout(() => {
                div.remove();
            }, 30000);
        })
        const main = chess.Element;
        if (!info.start || chess.player1MemberNumber === Player.MemberNumber || chess.player2MemberNumber === Player.MemberNumber) main.appendChild(sendButton);
        div.appendChild(main)
        ChatRoomAppendChat(div);
    }
}


export class Chess {
    public checkerboard: Checkerboard;
    public player1MemberNumber: number;
    public player1Name: string;
    public player2MemberNumber: number | null;
    public player2Name: string;

    public Round: number;

    private canChange1: boolean;
    private canChange2: boolean;

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

    private getPlayer1(): Character | null {
        return ChatRoomCharacter.find(c => c.MemberNumber == this.player1MemberNumber) ?? null;
    }
    private getPlayer1Name(): string {
        const P1 = this.getPlayer1();

        return P1 ? ((P1.Nickname === '' || !P1.Nickname) ? P1.Name : P1.Nickname) : '丢失'
    }
    private getPlayer2(): Character | null {
        if (this.player2MemberNumber === null) return null;
        return ChatRoomCharacter.find(c => c.MemberNumber == this.player2MemberNumber) ?? null;
    }
    private getPlayer2Name(): string {
        const P2 = this.getPlayer2();
        if (this.player2MemberNumber === null) return '未开始'
        return P2 ? ((P2.Nickname === '' || !P2.Nickname) ? P2.Name : P2.Nickname) : '丢失';
    }

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

    private chessCallClick(call: HTMLTableCellElement) {
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