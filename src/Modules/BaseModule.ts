export class BaseModule {
    moduleName: string = '';
    priority: number = 0;

    constructor() {
        this.init();
    }

    init(): void { }
    Load(): void { }
}