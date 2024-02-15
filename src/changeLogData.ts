export enum ChangeType {
	main,
	dev
}
interface ChangeLogObj {
	version: string;
	description: string;
	type: ChangeType;
	changes: string[];
}

export let CHANGELOG: ChangeLogObj[] = [
    {
        version: "0.0.1",
        description: "Initial release",
        type: ChangeType.dev,
        changes: ["完成基本框架测试中..."]
    },
    {
        version: "0.0.2",
        description: "修复",
        type: ChangeType.dev,
        changes: ["修复若干bug","添加部分动作"]
    },
    {
        version: "0.0.3",
        description: "修复",
        type: ChangeType.dev,
        changes: ["修复若干bug","完善框架"]
    },
    {
        version: "0.0.4",
        description: "终于修复了重复加载的Bug",
        type: ChangeType.dev,
        changes: ["修复重复加载的BUG!!!!!! O.o", "修复若干其他bug","完善框架"]
    },
    {
        version: "0.0.5",
        description: "优化",
        type: ChangeType.dev,
        changes: ["优化版本信息显示效果"]
    },
    {
        version: "0.1.0",
        description: "正式发布!当前功能如下: ",
        type: ChangeType.main,
        changes: ["使用命令导出当前聊天室聊天记录 支持按时间范围导出 详细请查看 /xsa ","添加9个额外动作."]
    },
    {
        version: "0.1.1",
        description: "添加了新的动作.",
        type: ChangeType.main,
        changes: ["添加了额外的17个动作","添加 /xsa act 命令 显示添加的全部动作", "完成功能自动口吃处理命令:(` + message) --请输入 /xsa jieba 查看帮助"]
    },
    {
        version: "0.1.2",
        description: "添加修改边缘逻辑.",
        type: ChangeType.main,
        changes: ["修复一些bug","修复了若干错别字","修改边缘影响，现在每45秒钟 边缘 ,将提高一层高潮抵抗难度，并且增加0.3~1.3秒的即将到来的高潮的持续时间-最多27秒持续时间，如果失去边缘状态，则同样的时间后失去一层抵抗难度，并且减少0.3~1.3秒高潮持续时间."]
    },
    {
        version: "0.1.3",
        description: "添加修改边缘逻辑以及高潮效果.添加打断抵抗高潮的瘙痒动作.",
        type: ChangeType.main,
        changes: ["当角色抵抗高潮时被挠痒，则重新开始抵抗并且增加一层难度","当高潮或抵抗高潮时禁用输入框.", " ` 命令修改，现在可以在 ` 后或者 数字后跟一个字母 m ，这将在结巴位置添加呻吟效果."]
    },
    {
        version: "0.1.4",
        description: "添加颜文字快速发送功能!",
        type: ChangeType.dev,
        changes: ["添加快速发送颜文字的功能，以下为简单介绍，详细介绍请输入:/xsa kaomoji 查看。\n使用=> |+[参数]  打开颜文字选择面板，| 为回车上面的按键，需要用 Shift+\\ 键打出 请输入 |help 查看全部参数", "调整忍耐高潮时每1.5秒有30%概率发送忍耐反应", "高潮后的高潮抵抗难度只降低一半而非原来的降低为0.", "重构注入到动作循环的逻辑", "重构模组的初始化与加载逻辑"]
    },
    {
        version: "0.1.5",
        description: "颜文字发送功能大修!",
        type: ChangeType.dev,
        changes: ["颜文字表情功能大修! 新版使用方法请输入/xsa kaomoji 查看!"]
    }
]