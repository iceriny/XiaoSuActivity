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

export const CHANGELOG: ChangeLogObj[] = [
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
        changes: ["修复若干bug", "添加部分动作"]
    },
    {
        version: "0.0.3",
        description: "修复",
        type: ChangeType.dev,
        changes: ["修复若干bug", "完善框架"]
    },
    {
        version: "0.0.4",
        description: "终于修复了重复加载的Bug",
        type: ChangeType.dev,
        changes: ["修复重复加载的BUG!!!!!! O.o", "修复若干其他bug", "完善框架"]
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
        changes: ["使用命令导出当前聊天室聊天记录 支持按时间范围导出 详细请查看 /xsa ", "添加9个额外动作."]
    },
    {
        version: "0.1.1",
        description: "添加了新的动作.",
        type: ChangeType.main,
        changes: ["添加了额外的17个动作", "添加 /xsa act 命令 显示添加的全部动作", "完成功能自动口吃处理命令:(` + message) --请输入 /xsa jieba 查看帮助"]
    },
    {
        version: "0.1.2",
        description: "添加修改边缘逻辑.",
        type: ChangeType.main,
        changes: ["修复一些bug", "修复了若干错别字", "修改边缘影响，现在每45秒钟 边缘 ,将提高一层高潮抵抗难度，并且增加0.3~1.3秒的即将到来的高潮的持续时间-最多27秒持续时间，如果失去边缘状态，则同样的时间后失去一层抵抗难度，并且减少0.3~1.3秒高潮持续时间."]
    },
    {
        version: "0.1.3",
        description: "添加修改边缘逻辑以及高潮效果.添加打断抵抗高潮的瘙痒动作.",
        type: ChangeType.main,
        changes: ["当角色抵抗高潮时被挠痒，则重新开始抵抗并且增加一层难度", "当高潮或抵抗高潮时禁用输入框.", " ` 命令修改，现在可以在 ` 后或者 数字后跟一个字母 m ，这将在结巴位置添加呻吟效果."]
    },
    {
        version: "0.1.4",
        description: "添加颜文字快速发送功能!",
        type: ChangeType.main,
        changes: ["添加快速发送颜文字的功能，以下为简单介绍，详细介绍请输入:/xsa kaomoji 查看。\n使用=> |+[参数]  打开颜文字选择面板，| 为回车上面的按键，需要用 Shift+\\ 键打出 请输入 |help 查看全部参数", "调整忍耐高潮时每1.5秒有30%概率发送忍耐反应", "高潮后的高潮抵抗难度只降低一半而非原来的降低为0.", "重构注入到动作循环的逻辑", "重构模组的初始化与加载逻辑"]
    },
    {
        version: "0.1.5",
        description: "颜文字发送功能大修!",
        type: ChangeType.main,
        changes: ["颜文字表情功能大修! 新版使用方法请输入/xsa kaomoji 查看!"]
    },
    {
        version: "0.2.0",
        description: "淫纹大修!  待续!",
        type: ChangeType.main,
        changes: ["淫纹大修! 输入 /xsa yw 查看功能.", "高潮抵抗难度和温度计进度现在可以跨平台继承 换句话说 掉线也不会丢失相关数据", "取消了原来的边缘计数，现在边缘等级和抵抗难度使用同一变量"]
    },
    {
        version: "0.3.0",
        description: "添加了新的动作(移植了部分浮绘的Sub动作)，但暂时移除了关于边缘和高潮机制的修改!",
        type: ChangeType.main,
        changes: ["将浮绘的Sub动作模组的部分(大量!)动作移植过来，感谢浮绘的授权! 原动作Mod:[https://github.com/FuhuiNeko/BC_Mods]",
            "暂时移除了边缘高潮机制的修改.",
            "暂时移除了淫纹功能的大修",
            "除了动作部分，功能将渐渐移植到新Mod",
            "新Mod链接: [https://github.com/iceriny/XiaosuBCExpansion]",
            "等新Mod功能完善将会在此Mod更新中提示!",
            "新Mod的当前版本已完成: 高潮机制修改(本Mod移植)、边缘机制修改(本Mod移植)、\n高潮余韵系统(暂无介绍，请自行探索 将来的版本将完善介绍，以及淫纹大修将依赖于此功能)"]
    },
    {
        version: "0.3.3",
        description: "添加了五子棋围棋对局功能!",
        type: ChangeType.main,
        changes: ['五子棋或围棋的对局功能，详细介绍请输入 `/xsa chess -h` 查看。', '修复了部分bug。']
    },
    {
        version: "0.3.4",
        description: "导出聊天记录可以精确到秒了; 命令增加自动补全",
        type: ChangeType.main,
        changes: ['命令功能现在可以在输入首字母后自动补全了，例如，输入`/x`然后按Tab键将自动补全为`/xsa`，在`/xsa`后输入空格加`c`(即`/xsa c`)然后按下空格则自动补全为`/xsa chess`',
        '现在聊天记录中的时间标记将显示精确到秒.', '现在按时间范围导出聊天记录的功能可以精确到秒了.']
    },
    {
        version: "0.3.5",
        description: "添加聊天室聊天记录的右键菜单",
        type: ChangeType.main,
        changes: ['右键聊天记录的条目可以呼出右键菜单', '如果有安装本插件 `回复` 功能显示特殊效果 如果没有安装被插件将显示为普通的正常说话的消息。']
    },
    {
        version: "0.4.0",
        description: "添加本地化框架，添加英文翻译(Added English translation.)",
        type: ChangeType.main,
        changes: ['Added English translation. Please go to: https://github.com/iceriny/XiaoSuActivity/issues for translation corrections']
    }
]