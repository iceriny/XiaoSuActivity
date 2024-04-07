import Fuse from 'fuse.js';
import { FuseResult } from 'fuse.js';
import { EMOJI } from './const';
import { conDebug } from 'utils';


export class Emoji {
    public static Init(): Emoji {
        conDebug('Emoji init');
        return new Emoji();
    }
    // private readonly EMOJI_DATA: emojiItem[];
    private fuse: Fuse<emojiItem>;

    constructor() {
        // this.EMOJI_DATA = EMOJI;

        const fuseKey: emojiItemKey[] = [
            'name',
            'zh_name'
        ]
        const fuseOptions = {
            keys: fuseKey,
            threshold: 0.3,
            includeScore: true,
            includeMatches: true,
            minMatchCharLength: 2,
            shouldSort: true,
            findAllMatches: true,
        };

        this.fuse = new Fuse(EMOJI, fuseOptions);
    }

    search(keyword: string): FuseResult<emojiItem>[] {
        if (keyword.length === 0) {
            return [];
        }

        const result = this.fuse.search(keyword, { limit: 7 });
        return result;
    }

    *giveEmojiResult(result: FuseResult<emojiItem>[]){
        if (result.length === 0) {
            return;
        }

        // const emojiResult = result.map(item => {
        //     return `<span class="emoji-item">${item.item.emoji}</span>`;
        // }).join('');

        for (const item of result) {
            conDebug({
                name: "----Emoji result Item-----",
                content: item
            })
            const emojiResult = `<span class="emoji-item">${item.item.name}:  ${item.item.emoji}</span>`;
            yield emojiResult;
        }
    }

}
