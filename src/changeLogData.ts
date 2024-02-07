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
    }
]