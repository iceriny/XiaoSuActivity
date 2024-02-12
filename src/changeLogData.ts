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
        description: "添加修改高潮逻辑.",
        type: ChangeType.dev,
        changes: ["修复一些bug","修复了若干错别字","修改边缘影响，现在每持续20秒钟 边缘 ,将提高一层高潮抵抗难度，并且增加0.3~1.3秒的即将到来的高潮的持续时间-最多27秒持续时间"]
    }
]