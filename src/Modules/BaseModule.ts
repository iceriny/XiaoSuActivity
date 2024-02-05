export interface _module {
    moduleName: string;
    priority: number;

    init(): void;
    Load(): void;
}

export class BaseModule  implements  _module{
    moduleName: string = '';
    priority: number = 0;

    constructor() {
        this.init();
    }

    init(): void { }
    Load(): void { }
}