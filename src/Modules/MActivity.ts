import { BaseModule } from "./BaseModule";

export class Activity extends BaseModule{
    moduleName = 'Activity';
    priority = 50;

    Load(): void {
        ActivityFemale3DCG
    }

    //============================================================
    /**
     * 创建活动对象的函数
     * @param  name - 活动的名称
     * @param  target - 活动的目标
     * @param  targetSelf - 活动的自身目标
     * @param  maxProgress - 活动的最大进度
     * @param  maxProgressSelf - 活动自身的最大进度
     * @param  activityExpression - 活动表达式,包含一系列的动作
     * @returns  - 包含创建的活动信息的对象
     */
//     createActivity(name:string, target:string, targetSelf:string, maxProgress:number, maxProgressSelf:number, prerequisite: Array<string>, activityExpression:Array<object>) {
//         const activity = {
//             Name: `Act_${name}`,
//             Target: [target],
//             TargetSelf: [targetSelf],
//             MaxProgress: maxProgress,
//             MaxProgressSelf: maxProgressSelf,
//             Prerequisite: prerequisite,
//             ActivityExpression: activityExpression,
//             InventoryGet
//         };
//         ActivityFemale3DCG.push(activity);
//         ActivityFemale3DCGOrdering.push(activity.Name);
//     }
}