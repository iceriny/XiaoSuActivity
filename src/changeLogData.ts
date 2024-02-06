enum ChangeType {
	main,
	dev
}
interface ChangeLogObj {
	version: string;
	description: string;
	type: ChangeType;
	changes: string[];
}

let CHANGELOG: ChangeLogObj[] = [
    {
        version: "0.0.1",
        description: "Initial release",
        type: ChangeType.dev,
        changes: []
    }
]