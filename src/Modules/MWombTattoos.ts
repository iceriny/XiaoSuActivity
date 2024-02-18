import { BaseModule } from "./BaseModule";
import { DataModule, PlayerStorage } from "./MData";
import { CharacterAppearanceIsLayerIsHave, conDebug, hookFunction, MSGType, PatchHook, SendActivity, PH } from "utils";
import { TimerProcessInjector } from "./MTimerProcessInjector";

type wombTattoosLayersName = "Zoom" | "Big" | "Bloom" | "BottomSpike" | "Flash" | "Fly" | "Grass" | "Grow" | "GrowHollow" | "HeartSmallOutline" | "Heartline" | "HeartSmall" | "HeartSolid" | "HeartWings" | "In" | "Leaves" | "MidSpike" | "Ribow" | "Sense" | "Shake" | "SideHearts" | "Swim" | "Thorn" | "ThornOut" | "TopSpike" | "Venom" | "Viper" | "Waves" | "WingSmall";
//  VVVV========淫纹大修=========VVVV  //
export class WombTattoosModule extends BaseModule {
    public Init(): void {
        this.moduleName = "WombTattoosModule";
        this.priority = 100;

        /**
         * 设置定时器进程注入序列，用于管理各个检查和处理逻辑的执行顺序、优先级及条件等信息
         */
        TimerProcessInjector.setProcessInjectionSequence = [
            {
                name: "WombTattoosCheck",
                priority: 10,
                /**
                 * 预先条件函数，判断是否满足执行该过程的条件
                 * 在本例中，返回值为 `WombTattoosModule.checkPlayerHaveWombTattoos()` 的结果
                 */
                preconditions: () => WombTattoosModule.checkPlayerHaveWombTattoos() && WombTattoosModule.isCheckWombTattoosEffect,
                timeInterval: 1000,

                /**
                 * 执行代码块，当预设条件满足时，会运行此函数体内的逻辑
                 * 此处功能：检查玩家当前应用的子宫纹身层，并根据子宫纹身效果模块(E)来决定哪些效果应当生效
                 */
                code: () => {
                    WombTattoosModule.isCheckWombTattoosEffect = false;
                    // 获取当前玩家应用的子宫纹身图层名称列表
                    const wombTattoosAppliedLayerNames = WombTattoosModule.getAppliedLayerNames(Player);

                    // 获取所有子宫纹身效果集合
                    const E = WombTattoosModule.wombTattoosEffects;

                    // 初始化已应用的效果列表
                    const appliedEffects: WombTattoosEffect[] = [];

                    // 遍历所有子宫纹身效果
                    for (const e in E) {
                        const effect = E[e];
                        const name = effect.name
                        // 如果当前效果的所有关联图层都在玩家已应用的图层列表中，则添加该效果至已应用效果列表
                        if (effect.layers.every(l => wombTattoosAppliedLayerNames.includes(l))) {
                            appliedEffects.push(name);
                        }
                    }
                    // 处理敏感等级 敏感等级在激活敏感效果的前提下 每多一个效果等级+1 每级额外增加0.5倍的敏感度


                    // 保存数据，将当前未应用的子宫纹身效果存储到游戏数据中
                    DataModule.SaveData({ WombTattoosAppliedEffects: appliedEffects, sensitiveLevel: appliedEffects.length });
                }
            },
            {
                name: "HaveWombTattoosEffectsHandle",
                priority: 11,
                timeInterval: 200,
                preconditions: () => (PlayerStorage()?.data?.haveWombTattoos ?? false) && (PlayerStorage()?.data?.WombTattoosAppliedEffects?.length ?? 0) > 0,
                code: () => {
                    // 获取所有子宫纹身效果集合
                    const E = WombTattoosModule.wombTattoosEffects;
                    // 遍历所有子宫纹身效果
                    for (const e in E) {
                        const effect = E[e];
                        if (effect.timerCode) effect?.timerCode();
                    }
                }
            }
        ];
    }

    public Load(): void {
        window.EdgeCount = 0;

        /** 在加载角色画布时，如果是玩家 则 检查是否有纹身 如果有则 添加纹身效果指示器 */
        hookFunction("CharacterLoadCanvas", 0, (args, next) => {
            if (args[0] === Player) {
                this.checkHaveWombTattoosToAddOrRemoveEffect();
            }
            return next(args)
        })

        const hookList: { [functionName: string]: PatchHook[] } = {}
        const WE = WombTattoosModule.wombTattoosEffects
        for (const e in WE) {
            const name = WE[e].name
            const hookItem = WE[name].hook;
            if (!hookItem) continue;
            for (const i in hookItem) {
                if (hookList[i]) {
                    hookList[i].push(hookItem[i].hook)
                } else {
                    hookList[i] = [hookItem[i].hook]
                }
            }
        }
        for (const fn in hookList) {
            for (const h in hookList[fn]) {
                hookFunction(fn, 5, hookList[fn][h])
            }
        }
        this.Loaded = true;
    }

    private static isCheckWombTattoosEffect: boolean = false;
    /** 玩家的纹身实例 */
    static get PlayerWombTattoos(): Item | null {
        for (const item of Player.Appearance) {
            if (item.Asset.Name === "WombTattoos") {
                return item;
            }
        }
        return null;
    }

    /**
     * 添加子宫纹身效果的方法，可选检查指定层，默认不检查
     * @param {boolean} checkLayer - 是否检查特定层，默认为false
     */
    private onHaveWombTattoos(checkLayer: boolean = false) {
        // 保存数据，根据checkLayer参数决定是否使用Player的子宫纹身状态，否则默认为true
        DataModule.SaveData({
            haveWombTattoos: checkLayer ? WombTattoosModule.haveWombTattoos(Player) : true
        });
    }

    /**
     * 移除子宫纹身效果的方法，可选检查指定层，默认不检查
     * @param {boolean} checkLayer - 是否检查特定层，默认为false
     */
    private offHaveWombTattoos(checkLayer: boolean = false) {
        // 保存数据，根据checkLayer参数决定是否使用Player的子宫纹身状态，否则默认为false
        DataModule.SaveData({
            haveWombTattoos: checkLayer ? WombTattoosModule.haveWombTattoos(Player) : false
        });
    }

    /**
     * 检查玩家是否拥有子宫纹身以添加或移除相应效果的方法
     */
    private checkHaveWombTattoosToAddOrRemoveEffect() {
        // 检查Player是否拥有子宫纹身
        if (WombTattoosModule.haveWombTattoos(Player)) {
            // 若有，则调用添加子宫纹身效果的方法
            this.onHaveWombTattoos();
            WombTattoosModule.isCheckWombTattoosEffect = true;
        } else {
            // 若无，则调用移除子宫纹身效果的方法
            this.offHaveWombTattoos();
            WombTattoosModule.isCheckWombTattoosEffect = false;
        }
    }

    /** 储存的纹身图层数据 */
    private wombTattoosLayers_data: AssetLayerDefinition[] | undefined;
    /** 获取纹身图层定义数据 */
    get wombTattoosLayers() {
        if (this.wombTattoosLayers_data) return this.wombTattoosLayers_data;
        return this.wombTattoosLayers_data = this.getWombTattoosLayers();
    }
    /** 纹身图层的名字 */
    static wombTattoosLayersName: wombTattoosLayersName[] = [
        "Zoom", // 膨胀
        "Big", //大
        "Bloom", // 开花
        "BottomSpike", // 底部尖刺
        "Flash", // 爆炸
        "Fly", // 飞
        "Grass", // 花托
        "Grow", // 卵巢
        "GrowHollow", // 卵巢-空心
        "HeartSmallOutline", // 心 小边缘
        "Heartline", // 心 边线
        "HeartSmall", // 心 小
        "HeartSolid", // 心 实心
        "HeartWings", // 心 翅膀
        "In", // 阴道
        "Leaves", // 叶子
        "MidSpike", // 中间尖刺
        "Ribow", // 心 丝带
        "Sense", // Sense(感官)
        "Shake", // 摇晃
        "SideHearts", // 两侧心
        "Swim", // 精子
        "Thorn", // 荆棘
        "ThornOut", // 荆棘-两侧
        "TopSpike", // 顶部尖刺
        "Venom", // 毒液
        "Viper", // 毒蛇
        "Waves", // 波浪
        "WingSmall" // 小翼
    ]
    static wombTattoosEffects: {
        [key: string]: { name: WombTattoosEffect, layers: string[], timerCode?: () => void, hook?: { [functionName: string]: { hook: PatchHook, priority: number } } }
    } = {
            sensitive: { // 敏感提升
                name: "sensitive",
                layers: ['Leaves'],
                hook: {
                    ActivityTimerProgress: {
                        priority: 3,
                        hook: (args, next) => {
                            if (args[0] == Player) {
                                const data = PlayerStorage()?.data.WombTattoosAppliedEffects;
                                if (data?.find(e => e === 'sensitive')) {
                                    conDebug({
                                        name: "sensitive触发 处理前",
                                        type: MSGType.DebugLog,
                                        content: args[1]
                                    }, "rgba(200, 154, 190, 1)");
                                    // 如果sensitiveLevel未定义则设置为1 当sensitive触发时 sensitiveLevel >= 1
                                    const sensitiveLevel = PlayerStorage()?.data?.sensitiveLevel ?? 1;
                                    // 如果sensitiveLevel ==1 快感倍数为2[   x  *  (2 + (1 - 1) * 0.5)  ]
                                    args[1] = args[1] * (2 + (sensitiveLevel - 1) * 0.5);
                                    conDebug({
                                        name: "sensitive触发 处理后",
                                        type: MSGType.DebugLog,
                                        content: args[1]
                                    }, "rgba(200, 154, 190, 1)");
                                }
                            }
                            return next(args)
                        },
                    }
                }
            },
            // orgasmControl: () => { //高潮控制

            // },
            pinkShock: { //PinkShock()
                name: "pinkShock",
                layers: ['Flash'],
                timerCode: () => {
                    if (PlayerStorage()?.data?.WombTattoosAppliedEffects.includes("pinkShock")){
                        if (Math.random() < 0.005) this.PinkShock();
                    }
                }
            }
        }

    private getWombTattoosLayers() {
        const a = AssetFemale3DCG.find(group => group.Group === 'BodyMarkings')?.Asset as AssetDefinition.Item[]
        return a.find(item => item.Name === "WombTattoos")?.Layer;
    }



    /**
     * 判断目标角色是否有淫纹
     */
    public static haveWombTattoos(C: Character | PlayerCharacter): boolean {
        //查找WombTattoos
        for (const item of C.Appearance) {
            if (item.Asset.Name === "WombTattoos") return true;
        }
        return false;
    }
    public static checkPlayerHaveWombTattoos() {
        return Player.XSA?.data.haveWombTattoos ?? false
    }

    /**
     * 返回目标角色应用的淫纹图层
     * @param C 要检测的角色
     * @returns 已经应用的图层
     */
    public static getAppliedLayerNames(C: Character | PlayerCharacter): string[] {
        const appliedLayersNames = [];
        const wombTattoos = C.DrawAppearance?.find(item => item.Asset.Name === "WombTattoos");
        if (wombTattoos) {
            const asset = wombTattoos.Asset;
            if (InventoryChatRoomAllow(asset.Category as readonly ServerChatRoomBlockCategory[])) {
                const typeRecord = wombTattoos.Property && wombTattoos.Property.TypeRecord;
                const appliedLayers = asset.Layer.filter(layer => CharacterAppearanceIsLayerIsHave(C, layer, typeRecord)); // 这里有问题 如果当前姿势不可见的时候也会把那个图层过滤掉 // 尝试用新的函数
                const results = appliedLayers.map(item => item.Name);
                for (const name of results) {
                    if (name !== null) appliedLayersNames.push(name);
                }
            }
        }
        return appliedLayersNames;
    }


    public static PinkShock() {
        AudioPlayInstantSound("Audio/Shocks.mp3");
        SendActivity(`${PH.s}的淫纹突然发出一丝诱人的波动，释放出一道电流!`, Player.MemberNumber!);
        InventoryShockExpression(Player);
        DrawFlashScreen("#FF64C4", 1000, 5);
        const currentProgress = Player.ArousalSettings?.Progress;
        const addedProgress = (currentProgress ?? 0) + 30;
        ActivitySetArousal(Player, addedProgress > 100 ? 100 : addedProgress);
    }
}
//  ^^^^========淫纹大修=========^^^^  //