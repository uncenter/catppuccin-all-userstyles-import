type UserstylesExport = Userstyle[];

type Userstyle = {
	enabled: boolean;
	name?: string;
	description?: string;
	author?: string;
	updateUrl?: string;
	usercssData: UsercssData;
	sourceCode: string;
	settings?: Settings;
};

type UsercssData = {
	name: string;
	namespace: string;
	homepageURL: string;
	version: string;
	updateURL: string;
	supportURL: string;
	description: string;
	author: string;
	license: string;
	preprocessor: string;
	vars: Vars;
};

type Vars = {
	flavor?: Variable;
	accentColor?: Variable;
	lightFlavor?: Variable;
	darkFlavor?: Variable;
};

type Variable = {
	type: string;
	label: string;
	name: string;
	value: any;
	default: string;
	options: Option[];
};

type Option = {
	name: string;
	label: string;
	value: string;
};

type Settings = {
	updateInterval: number;
	updateOnlyEnabled: boolean;
	patchCsp: boolean;
};
