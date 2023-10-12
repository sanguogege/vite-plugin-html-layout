import { resolve } from "path";
import { Options } from "./type";
import { PluginOption } from "vite";
import CheckPath from "./utils/getHtmlArray";
import replacePartialToLayout from "./core";

let CreatHtmlLayout = (Options: Options): PluginOption => {
	return {
		name: "plugin-layout",
		transformIndexHtml: {
			enforce: "pre",
			transform: (html: string) => {
				return replacePartialToLayout(Options, html);
			},
		},
		async configResolved(config) {
			if (config.build) {
				config.build.rollupOptions = {
					input: await CheckPath(resolve(config.root)),
				};
			}
		},
	};
};

export default CreatHtmlLayout;
