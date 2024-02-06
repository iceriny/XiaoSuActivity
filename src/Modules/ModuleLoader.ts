import { BaseModule, XS_ModuleName } from "./BaseModule";
import { ChatroomModule } from "./MChatroom";
import { CommandsModule } from "./MCommand";
import { modules } from "./ModulesDict";
import { ActivityModule } from "./MActivity";
import { conDebug } from "utils";

export class ModuleLoader {
    public static modules: { [key: string]: BaseModule } = modules;
    static mList: [BaseModule] | undefined;
    public static modulesCount: number = 0;


    /**
     * 加载模块   Loader对外入口.
     */
    public static LoadModules(): number {
        const moduleC = this.generateModule();

        // 如果模块列表存在
        if (typeof this.mList !== "undefined") {
            // 对模块列表进行排序，按照优先级升序排列
            this.mList
                .sort((a, b) => a.priority - b.priority)
                .forEach((m) => {
                    // 加载模块
                    m.Load();
                    conDebug(`模块 ${m.moduleName} 加载完成`);
                });
        }
        return moduleC
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

        this.modulesCount++;
    }

    public static ModuleMap: { [mName in XS_ModuleName]: () => void } = {
        Base: () => {
            throw new Error("Base为模块的抽象类，请勿加载");
        },
        ActivityModule: () => {
            this.pushToModules(new ActivityModule());
        },
        ChatroomModule: () => {
            this.pushToModules(new ChatroomModule());
        },
        CommandsModule: () => {
            this.pushToModules(new CommandsModule());
        }
    }


    private static generateModule(): number {
        for (const mN in ModuleLoader.ModuleMap) {
            if (mN !== "Base" && this.modules[mN] === undefined) ModuleLoader.ModuleMap[mN as XS_ModuleName]();
        }

        return this.modulesCount;
    }

}