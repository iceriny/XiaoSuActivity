import { SendLocalMessage, hookFunction } from "utils";
import { BaseModule } from "./BaseModule";


export class ChessModule extends BaseModule {
    private static get newCheckerboard(): Checkerboard {
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
                    this.ShowChessboard(CheckerInfo);
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


    SendAChess(Player1: number, Player2: number | undefined, Round: number, checkerboard: Checkerboard = ChessModule.newCheckerboard) {
        const CheckerInfo: ChessDictionaryEntry = { Player1, Player2, Round: Round, Checkerboard: checkerboard, start: false }
        //if (!Player2) this.ShowChessboard(CheckerInfo);
        ServerSend("ChatRoomChat", { Type: 'Hidden', Content: 'XSA_Chess', Dictionary: [CheckerInfo] })
    }

    ShowChessboard(info: ChessDictionaryEntry) {
        const Player1 = ChatRoomCharacter.find(c => c.MemberNumber == info.Player1);
        const Player2 = ChatRoomCharacter.find(c => c.MemberNumber == info.Player2);


        let content = `<div class="chessContainer"><div>玩家1: ${(Player1?.Nickname ?? Player1?.Name) ?? '丢失'}   玩家2: ${info.start ? (Player2?.Nickname ?? Player2?.Name) : '未开始'}</div>`

        let checkerboard = `<table border="1" class="chessTable">`;
        for (const row of info.Checkerboard) {
            checkerboard += '<tr>';
            for (const i of row) {
                if (i === null) checkerboard += `<td class="chessCell"></td>`;
                if (i === true) checkerboard += `<td>⚫</td>`;
                if (i === false) checkerboard += `<td>⚪</td>`;
            }
            checkerboard += '</tr>';
        }
        checkerboard += '</table>';
        content += checkerboard + '</div>';



        SendLocalMessage(content)
    }
}