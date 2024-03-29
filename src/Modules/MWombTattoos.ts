// import { BaseModule } from "./BaseModule";
// import { DataModule, PlayerStorage } from "./MData";
// import { CharacterAppearanceIsLayerIsHave, hookFunction, PatchHook, SendActivity, PH, SendLocalMessage } from "utils";
// import { TimerProcessInjector } from "./MTimerProcessInjector";
// import { DrawModule } from "./MDrawModule";
// import randomColor from 'randomcolor';
// import { ArousalModule } from "./MArousal";


// type wombTattoosLayersName = "Zoom" | "Big" | "Bloom" | "BottomSpike" | "Flash" | "Fly" | "Grass" | "Grow" | "GrowHollow" | "HeartSmallOutline" | "Heartline" | "HeartSmall" | "HeartSolid" | "HeartWings" | "In" | "Leaves" | "MidSpike" | "Ribow" | "Sense" | "Shake" | "SideHearts" | "Swim" | "Thorn" | "ThornOut" | "TopSpike" | "Venom" | "Viper" | "Waves" | "WingSmall";
// //  VVVV========淫纹大修=========VVVV  //

// export class WombTattoosModule extends BaseModule {
//     public Init(): void {
//         this.moduleName = "WombTattoosModule";
//         this.priority = 100;

//         /**
//          * 设置定时器进程注入序列，用于管理各个检查和处理逻辑的执行顺序、优先级及条件等信息
//          */
//         TimerProcessInjector.setProcessInjectionSequence = [
//             {
//                 name: "WombTattoosCheck",
//                 priority: 10,

//                 // 预先条件函数，判断是否满足执行该过程的条件
//                 // 在本例中，返回值为 `WombTattoosModule.checkPlayerHaveWombTattoos()` 的结果
//                 preconditions: () => WombTattoosModule.checkPlayerHaveWombTattoos() && WombTattoosModule.isCheckWombTattoosEffect,
//                 timeInterval: 1000,

//                 // 执行代码块，当预设条件满足时，会运行此函数体内的逻辑
//                 // 此处功能：检查玩家当前应用的子宫纹身层，并根据子宫纹身效果模块(E)来决定哪些效果应当生效
//                 code: () => {
//                     // 触发该代码块后 `isCheckWombTattoosEffect` 设置为 `false`，以防止后续的持续检查逻辑执行消耗资源
//                     WombTattoosModule.isCheckWombTattoosEffect = false;

//                     // 获取当前玩家应用的子宫纹身图层名称列表
//                     const wombTattoosAppliedLayerNames = WombTattoosModule.getAppliedLayerNames(Player);

//                     // 获取所有子宫纹身效果集合
//                     const E = WombTattoosModule.wombTattoosEffects;

//                     // 初始化已应用的效果列表
//                     const appliedEffects: WombTattoosEffect[] = [];

//                     // 如果有核心图层 HeartSmall
//                     if (wombTattoosAppliedLayerNames.includes('HeartSmall')) {
//                         // 遍历所有子宫纹身效果 
//                         for (const e in E) {
//                             const effect = E[e];
//                             const name = effect.name
//                             // 如果有心(小)图层 当前效果的所有关联图层都在玩家已应用的图层列表中，则添加该效果至已应用效果列表
//                             if (effect.layers.every(l => wombTattoosAppliedLayerNames.includes(l))) {
//                                 appliedEffects.push(name);
//                             }
//                         }
//                     }

//                     // 处理敏感等级 敏感等级在激活敏感效果的前提下 每多一个效果等级+1 每级额外增加0.5倍的敏感度
//                     // 保存数据，将当前未应用的子宫纹身效果存储到游戏数据中
//                     DataModule.SaveData({ wombTattoosAppliedEffects: appliedEffects, sensitiveLevel: appliedEffects.length });
//                 }
//             },
//             {
//                 name: "HaveWombTattoosEffectsHandle",
//                 priority: 11,
//                 timeInterval: 200,
//                 preconditions: () => (PlayerStorage()?.data?.haveWombTattoos ?? false) && (PlayerStorage()?.data?.wombTattoosAppliedEffects?.length ?? 0) > 0,
//                 code: () => {
//                     // 获取所有子宫纹身效果集合
//                     const E = WombTattoosModule.wombTattoosEffects;
//                     // 遍历所有子宫纹身效果
//                     for (const e in E) {
//                         const effect = E[e];
//                         if (effect.defaultTimerCode) effect?.defaultTimerCode();
//                     }
//                 }
//             },
//             {
//                 name: "RandomTrance",
//                 priority: 13,
//                 timeInterval: WombTattoosModule.wombTattoosEffects.trance.dynamicTimeInterval!,
//                 preconditions: () => WombTattoosModule.HasWombTattoosEffect(Player, 'trance'),
//                 code: () => {
//                     WombTattoosModule.wombTattoosEffects.trance.customizeTimerCode!();
//                 }
//             }
//         ];
//     }

//     public Load(): void {
//         /** 在加载角色画布时，如果是玩家 则 检查是否有纹身 如果有则 添加纹身效果指示器 */
//         hookFunction("CharacterLoadCanvas", 0, (args, next) => {
//             if (args[0] === Player) {
//                 this.checkHaveWombTattoosToAddOrRemoveEffect();
//             }
//             return next(args)
//         })

//         const hookList: { [functionName: string]: [PatchHook, number][] } = {}
//         const WE = WombTattoosModule.wombTattoosEffects
//         for (const e in WE) {
//             const name = WE[e].name
//             const hookItem = WE[name].hook;
//             if (!hookItem) continue;
//             for (const i in hookItem) {
//                 if (hookList[i]) {
//                     hookList[i].push([hookItem[i].hook, hookItem[i].priority])
//                 } else {
//                     hookList[i] = [[hookItem[i].hook, hookItem[i].priority]]
//                 }
//             }
//         }
//         for (const fn in hookList) {
//             for (const h in hookList[fn]) {
//                 hookFunction(fn, hookList[fn][h][1], hookList[fn][h][0])
//             }
//         }
//         this.Loaded = true;
//     }

//     private static isCheckWombTattoosEffect: boolean = false;
//     /** 玩家的纹身实例 */
//     static get PlayerWombTattoos(): Item | null {
//         for (const item of Player.Appearance) {
//             if (item.Asset.Name === "WombTattoos") {
//                 return item;
//             }
//         }
//         return null;
//     }

//     /**
//      * 获取目标应用的纹身效果
//      * @param C 要获取的角色
//      * @returns 返回目标的已经应用的纹身效果列表
//      */
//     public static GetCharacterWombTattoosEffects(C: Character | PlayerCharacter): WombTattoosEffect[] | null {
//         if (C.IsOnline()) {
//             if (C.IsPlayer()) return C.XSA?.data?.wombTattoosAppliedEffects ?? [];
//             else return C.OnlineSharedSettings?.XSA?.wombTattoosAppliedEffects ?? [];
//         }
//         return [];
//     }

//     /**
//      * 检测目标角色是否具有对应的效果
//      * @param C 要检测的角色
//      * @param effectName 要检测的效果名
//      * @returns 是否有该效果
//      */
//     public static HasWombTattoosEffect(C: Character | PlayerCharacter, effectName: WombTattoosEffect): boolean {
//         const haveEffects = this.GetCharacterWombTattoosEffects(C);
//         if (haveEffects && haveEffects.includes(effectName)) return true;
//         else return false;
//     }

//     /**
//      * 添加子宫纹身效果的方法，可选检查指定层，默认不检查
//      * @param {boolean} checkLayer - 是否检查特定层，默认为false
//      */
//     private onHaveWombTattoos(checkLayer: boolean = false) {
//         // 保存数据，根据checkLayer参数决定是否使用Player的子宫纹身状态，否则默认为true
//         DataModule.SaveData({
//             haveWombTattoos: checkLayer ? WombTattoosModule.haveWombTattoos(Player) : true
//         });
//     }

//     /**
//      * 移除子宫纹身效果的方法，可选检查指定层，默认不检查
//      * @param {boolean} checkLayer - 是否检查特定层，默认为false
//      */
//     private offHaveWombTattoos(checkLayer: boolean = false) {
//         // 保存数据，根据checkLayer参数决定是否使用Player的子宫纹身状态，否则默认为false
//         DataModule.SaveData({
//             haveWombTattoos: checkLayer ? WombTattoosModule.haveWombTattoos(Player) : false
//         });
//     }

//     /**
//      * 检查玩家是否拥有子宫纹身以添加或移除相应效果的方法
//      */
//     private checkHaveWombTattoosToAddOrRemoveEffect() {
//         // 检查Player是否拥有子宫纹身
//         if (WombTattoosModule.haveWombTattoos(Player)) {
//             // 若有，则调用添加子宫纹身效果的方法
//             this.onHaveWombTattoos();
//             WombTattoosModule.isCheckWombTattoosEffect = true;
//         } else {
//             // 若无，则调用移除子宫纹身效果的方法
//             this.offHaveWombTattoos();
//             WombTattoosModule.isCheckWombTattoosEffect = false;
//             DataModule.SaveData({wombTattoosAppliedEffects: [], sensitiveLevel: 0})
//         }
//     }

//     /** 储存的纹身图层数据 */
//     private wombTattoosLayers_data: AssetLayerDefinition[] | undefined;
//     /** 获取纹身图层定义数据 */
//     get wombTattoosLayers() {
//         if (this.wombTattoosLayers_data) return this.wombTattoosLayers_data;
//         return this.wombTattoosLayers_data = this.getWombTattoosLayers();
//     }
//     /** 纹身图层的名字 */
//     static wombTattoosLayersName: wombTattoosLayersName[] = [
//         "Zoom", // 膨胀
//         "Big", //大
//         "Bloom", // 开花 
//         "BottomSpike", // 底部尖刺
//         "Flash", // 爆炸
//         "Fly", // 飞  :开花 
//         "Grass", // 花托
//         "Grow", // 卵巢
//         "GrowHollow", // 卵巢-空心
//         "HeartSmallOutline", // 心 小边缘
//         "Heartline", // 心 边线
//         "HeartSmall", // 心 小
//         "HeartSolid", // 心 实心
//         "HeartWings", // 心 翅膀
//         "In", // 阴道
//         "Leaves", // 叶子
//         "MidSpike", // 中间尖刺
//         "Ribow", // 心 丝带
//         "Sense", // Sense(感官)
//         "Shake", // 摇晃
//         "SideHearts", // 两侧心
//         "Swim", // 精子
//         "Thorn", // 荆棘
//         "ThornOut", // 荆棘-两侧
//         "TopSpike", // 顶部尖刺
//         "Venom", // 毒液
//         "Viper", // 毒蛇
//         "Waves", // 波浪
//         "WingSmall" // 小翼
//     ]
//     static wombTattoosEffects: {
//         [key: string]:
//         {
//             name: WombTattoosEffect, layers: wombTattoosLayersName[],
//             defaultTimerCode?: () => void, customizeTimerCode?: () => void, highFrequencyTimerTimerCode?: () => void, dynamicTimeInterval?: () => number,
//             hook?: { [functionName: string]: { hook: PatchHook, priority: number } }
//         }
//     } = {
//             sensitive: { // 敏感提升
//                 name: "sensitive",
//                 layers: ['Leaves'],
//                 hook: {
//                     ActivityTimerProgress: {
//                         priority: 3,
//                         hook: (args, next) => {
//                             const C = args[0] as Character;
//                             let addedProgress = args[1] as number;
//                             if (C.IsOnline()) {
//                                 if (C.IsPlayer()) {
//                                     const data = PlayerStorage()?.data.wombTattoosAppliedEffects;
//                                     if (data?.find(e => e === 'sensitive')) {
//                                         // 如果sensitiveLevel未定义则设置为1 当sensitive触发时 sensitiveLevel >= 1
//                                         const sensitiveLevel = PlayerStorage()?.data?.sensitiveLevel ?? 1;
//                                         // 如果sensitiveLevel ==1 快感倍数为2[   x  *  (2 + (1 - 1) * 0.5)  ]
//                                         addedProgress = WombTattoosModule.handleProgressParametersBasedOnSensitivityLevel(addedProgress, sensitiveLevel);
//                                     }
//                                 } else { // 处理非玩家自己的逻辑
//                                     const onlineSharedSettings = C.OnlineSharedSettings?.XSA;
//                                     if (onlineSharedSettings
//                                         && onlineSharedSettings.sensitiveLevel) {
//                                         if (onlineSharedSettings?.wombTattoosAppliedEffects?.find(e => e === 'sensitive')) {
//                                             const sensitiveLevel = onlineSharedSettings?.sensitiveLevel;
//                                             addedProgress = WombTattoosModule.handleProgressParametersBasedOnSensitivityLevel(addedProgress, sensitiveLevel);
//                                         }
//                                     }
//                                 }
//                             }
//                             args[1] = addedProgress;
//                             return next(args)
//                         },
//                     }
//                 }
//             },
//             // orgasmControl: () => { //高潮控制

//             // },
//             pinkShock: { //电击
//                 name: "pinkShock",
//                 layers: ['Flash'],
//                 defaultTimerCode: () => {
//                     if (WombTattoosModule.HasWombTattoosEffect(Player, 'pinkShock')) {
//                         if (Math.random() < 0.0018) {
//                             this.PinkShock();
//                         }
//                     }
//                 }
//             },
//             trance: { // 迷幻 使用随机的 10 ~ 20 分钟 动态的时间间隔来控制时间间隔
//                 name: 'trance',
//                 layers: ['Bloom', 'Fly'],
//                 hook: {
//                     'Player.GetSlowLevel': {
//                         priority: 20,
//                         hook: (args, next) => {
//                             if (Player.RestrictionSettings?.SlowImmunity)
//                                 return 0;
//                             else if (this.IsTrancing) {
//                                 return Math.floor((Math.random() * 3) + 1);
//                             }
//                             return next(args)
//                         }
//                     }
//                 },
//                 defaultTimerCode: () => {
//                     if (WombTattoosModule.HasWombTattoosEffect(Player, 'trance') && this.IsTrancing) {
//                         if (Math.random() < 0.006) {
//                             ArousalModule.needActivityOrgasmRuined = true;
//                             ActivityOrgasmPrepare(Player);
//                             SendActivity(`${PH.s}被自己的淫纹影响，突然一阵剧烈的快感袭来，却仿佛梦幻般消失.....`, Player.MemberNumber!);
//                         }
//                         if (Math.random() < 0.015) {
//                             SendLocalMessage(this.getTranceMessage, 'trance-message', 6000);
//                         }
//                     }
//                 },
//                 customizeTimerCode: () => {
//                     // TODO: 迷幻演出
//                     WombTattoosModule.Trance();
//                 },
//                 dynamicTimeInterval: (): number => ((Math.random() + 1) * 600000) //////////////////测试使用0.333分钟~1.333分钟/////////////// 十~二十 分钟触发一次 600000 
//             }
//         }


//     /**
//      * 根据敏感等级处理进度参数----
//      * 如果sensitiveLevel ==1 快感倍数为2[   x  *  (2 + (1 - 1) * 0.5)  ]
//      * @param args 正常的增加进度
//      * @param sensitiveLevel 敏感等级
//      */
//     private static handleProgressParametersBasedOnSensitivityLevel(addedProgress: number, sensitiveLevel: number) {
//         addedProgress = addedProgress * (2 + (sensitiveLevel - 1) * 0.5);
//         return addedProgress;
//     }

//     private getWombTattoosLayers() {
//         const a = AssetFemale3DCG.find(group => group.Group === 'BodyMarkings')?.Asset as AssetDefinition.Item[]
//         return a.find(item => item.Name === "WombTattoos")?.Layer;
//     }



//     /**
//      * 判断目标角色是否有淫纹
//      */
//     public static haveWombTattoos(C: Character | PlayerCharacter): boolean {
//         //查找WombTattoos
//         for (const item of C.Appearance) {
//             if (item.Asset.Name === "WombTattoos") return true;
//         }
//         return false;
//     }
//     /**
//      * @see checkHaveWombTattoosToAddOrRemoveEffect
//      * @see onHaveWombTattoos
//      * @see offHaveWombTattoos
//      * @returns 玩家的XSA.data.haveWombTattoos是否为真 表示玩家是否有淫纹
//      */
//     public static checkPlayerHaveWombTattoos() {
//         return Player.XSA?.data.haveWombTattoos ?? false
//     }

//     /**
//      * 返回目标角色应用的淫纹图层
//      * @param C 要检测的角色
//      * @returns 已经应用的图层
//      */
//     public static getAppliedLayerNames(C: Character | PlayerCharacter): string[] {
//         const appliedLayersNames = [];
//         const wombTattoos = C.DrawAppearance?.find(item => item.Asset.Name === "WombTattoos");
//         if (wombTattoos) {
//             const asset = wombTattoos.Asset;
//             if (InventoryChatRoomAllow(asset.Category as readonly ServerChatRoomBlockCategory[])) {
//                 const typeRecord = wombTattoos.Property && wombTattoos.Property.TypeRecord;
//                 const appliedLayers = asset.Layer.filter(layer => CharacterAppearanceIsLayerIsHave(C, layer, typeRecord));
//                 const results = appliedLayers.map(item => item.Name);
//                 for (const name of results) {
//                     if (name !== null) appliedLayersNames.push(name);
//                 }
//             }
//         }
//         return appliedLayersNames;
//     }



//     public static PinkShock() {
//         AudioPlayInstantSound("Audio/Shocks.mp3");
//         SendActivity(`${PH.s}的淫纹突然发出一丝诱人的光芒，释放出一道奇异的粉色电流!`, Player.MemberNumber!);
//         InventoryShockExpression(Player);
//         const currentProgress = Player.ArousalSettings?.Progress;
//         const addedProgress = (currentProgress ?? 0) + 30;
//         if (addedProgress > 100) {
//             ActivitySetArousal(Player, 100);
//             ActivityOrgasmPrepare(Player);
//         } else {
//             ActivitySetArousal(Player, addedProgress);
//         }
//         DrawModule.setFlash('#FF2ED9', 1000, 500);
//     }

//     private static readonly tranceMessage: string[] = [
//         `你的身体开始发软，大脑开始一片空白.....`,
//         `你的意识突然变得模糊，似乎在进入一种未知的状态......`,
//         `你的身体突然抖动一下，好像看到了什么...或感觉到了什么...`,
//         `你的意识突然变得清晰，似乎恢复了正..?..正常么?`
//     ]
//     private static get getTranceMessage() {
//         return WombTattoosModule.tranceMessage[Math.floor(Math.random() * WombTattoosModule.tranceMessage.length)];
//     }

//     /** 在恍惚中  */
//     public static IsTrancing: boolean = false;

//     private static Trance() {///////////////////////////////////BUG!!! 登录游戏会触发一次 检查条件
//         WombTattoosModule.IsTrancing = true;
//         SendActivity(`${PH.s}被自己的淫纹影响，大脑陷入了一阵恍惚之中.....`, Player.MemberNumber!);
//         const pt = Player.ArousalSettings?.ProgressTimer ?? 0;
//         if (Player.ArousalSettings?.ProgressTimer) {
//             Player.ArousalSettings.ProgressTimer = pt + 25;
//         }
//         AudioPlayInstantSound("Audio/BellMedium.mp3");

//         DrawModule.setFlash(randomColor({
//             luminosity: 'light',
//             hue: 'pink',
//         }), 20000, 80, () => {
//             AudioPlayInstantSound("Audio/BellMedium.mp3", 0.5);
//             WombTattoosModule.IsTrancing = false;
//         });
//         DrawModule.setDrawBlur(10000, 15);
//     }
// }
// //  ^^^^========淫纹大修=========^^^^  //
