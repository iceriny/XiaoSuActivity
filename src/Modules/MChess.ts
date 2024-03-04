import { hookFunction } from "utils";
import { BaseModule } from "./BaseModule";


export class ChessModule extends BaseModule {
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

    static ChangeCheckerboard(rowIndex: number, colIndex: number, value: 0 | 1 | 2, checkerboard: Checkerboard): void {
        switch (value) {
            case 0:
                checkerboard[rowIndex - 1][colIndex - 1] = null;
                break;
            case 1:
                checkerboard[rowIndex - 1][colIndex - 1] = true;
                break;
            case 2:
                checkerboard[rowIndex - 1][colIndex - 1] = false;
                break;
        }
    }
    SendAChess(Player1: number, Player2: number | undefined, Round: number, checkerboard: Checkerboard = ChessModule.newCheckerboard, started: boolean = false) {
        const CheckerInfo: ChessDictionaryEntry = { Player1, Player2, Round: Round, Checkerboard: checkerboard, start: started, sender: Player.MemberNumber ?? -1 }
        //if (!Player2) this.ShowChessboard(CheckerInfo);
        ServerSend("ChatRoomChat", { Type: 'Hidden', Content: 'XSA_Chess', Dictionary: [CheckerInfo], Sender: Player.MemberNumber })
    }


    ShowChessboard(info: ChessDictionaryEntry, sender: number) {
        const Player1 = ChatRoomCharacter.find(c => c.MemberNumber == info.Player1);
        if (!info.Player2 && Player1 !== Player) info.Player2 = Player.MemberNumber;
        const Player2 = ChatRoomCharacter.find(c => c.MemberNumber == info.Player2);

        // Adds the message and scrolls down unless the user has scrolled up
        const div = document.createElement("div");
        div.setAttribute('class', 'ChatMessage ChatMessage' + 'LocalMessage');
        div.setAttribute('data-time', ChatRoomCurrentTime());
        div.setAttribute('data-sender', sender);


        // 容器
        const main: HTMLDivElement = document.createElement('div');
        main.className = 'chessContainer';
        // 标题
        const title: HTMLDivElement = document.createElement('div');
        title.innerHTML = `玩家1: ${(Player1?.Nickname ?? Player1?.Name) ?? '丢失'}   玩家2: ${info.start ? (Player2?.Nickname ?? Player2?.Name) : '未开始'}`;
        main.appendChild(title);

        // 棋牌
        const checkerboard: HTMLTableElement = document.createElement('table');
        checkerboard.className = 'chessTable';

        // 棋子
        let rowIndex = 0;
        let colIndex = 0;
        // 获取信息
        for (const row of info.Checkerboard) {
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
                    // 获取值
                    const callValue = call.getAttribute('value');
                    // 如果当前操作者是玩家1 
                    if (Player.MemberNumber === Player1?.MemberNumber) {
                        // 如果当前值为0则设置为1(悔棋或修改)，否则设置为0
                        if (callValue === '0') call.setAttribute('value', 1);
                        if (callValue === '1') call.setAttribute('value', 0);
                    }
                    // 如果当前操作者是玩家2
                    if (Player.MemberNumber === Player2?.MemberNumber) {
                        // 如果当前值为0则设置为1(悔棋或修改)，否则设置为0
                        if (callValue === '0') call.setAttribute('value', 2);
                        if (callValue === '2') call.setAttribute('value', 0);
                    }
                    // 设置棋子颜色 玩家1为白色 2为黑色
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
                });

                // 设置棋子颜色 玩家1为白色 2为黑色
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
                // 添加到行中
                tableRow.appendChild(call);
            }
            // 添加到棋盘中
            checkerboard.appendChild(tableRow);
        }
        // 添加到主容器中
        main.appendChild(checkerboard);

        // 发送按钮
        const sendButton: HTMLButtonElement = document.createElement('button');
        sendButton.innerHTML = '发送';
        sendButton.addEventListener('click', () => {
            // 获取棋子信息
            const newCheckerboard = ChessModule.newCheckerboard;

            // 遍历表格的所有行
            for (let i = 0; i < checkerboard.rows.length; i++) {
                const row = checkerboard.rows[i];
                // 遍历当前行的所有单元格
                for (let j = 0; j < row.cells.length; j++) {
                    const cell = row.cells[j];
                    if (cell.getAttribute('value') !== '0') {
                        // 获取行和列的序号
                        const rowIndex = parseInt(cell.getAttribute('row') ?? -1);
                        const colIndex = parseInt(cell.getAttribute('col') ?? -1);
                        const value = parseInt(cell.getAttribute('value') ?? -1) as -1 | 0 | 1 | 2;
                        if (rowIndex === -1 || colIndex === -1 || value === -1) return;
                        // 修改棋子信息
                        ChessModule.ChangeCheckerboard(rowIndex, colIndex, value, newCheckerboard);
                    }
                }
            }
            this.SendAChess(Player1?.MemberNumber ?? 0, Player2?.MemberNumber ?? 0, info.Round + 1, newCheckerboard, !!Player2);
            sendButton.disabled = true;
            sendButton.remove();
            // setTimeout(() => {
            //     div.remove();
            // }, 1000);
        })
        if (!info.start || Player1 === Player.MemberNumber || Player2 === Player.MemberNumber) main.appendChild(sendButton);

        div.appendChild(main)

        ChatRoomAppendChat(div);
    }
}