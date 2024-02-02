import { BaseModule } from "./BaseModule";
import { Chatroom } from "./MChatroom";
import { Commands } from "./MCommand";
import { modules } from "./ModulesDict";
import { Activity } from "./MActivity";

export class ModuleLoader {
    public static modules: { [key: string]: BaseModule } = modules;
    static mList: [BaseModule] | undefined;


    /**
     * 加载模块   Loader对外入口.
     */
    public static LoadModules(): void {
        this.generateModule();

        // 如果模块列表存在
        if (typeof this.mList !== "undefined") {
            // 对模块列表进行排序，按照优先级升序排列
            this.mList
                .sort((a, b) => a.priority - b.priority)
                .forEach((m) => {
                    // 加载模块
                    m.Load();
                });
        }
    }


    /**
     * 将模块添加到模块数组中
     * @param module 要添加的模块对象
     */
    private static pushToModules(module: BaseModule): void {
        this.modules[module.moduleName] = module;
        if (typeof this.mList !== "undefined") {
            this.mList.push(module);
        } else {
            this.mList = [module];
        }
    }

    private static generateModule(): void {
        this.pushToModules(new Chatroom());
        this.pushToModules(new Commands());
        // this.pushToModules(new Activity());
    }

}