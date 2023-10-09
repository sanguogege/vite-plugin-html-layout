import { readFile, readdir } from "fs/promises";
import { resolve } from "path";
import { parse, parseFragment, serializeOuter, serialize } from "parse5";
import Handlebars from "handlebars";
import { Options } from "./type";

function findAndRemoveElement(childNode: any, parentNode: any) {
	const index = parentNode.childNodes.indexOf(childNode);
	if (index > -1) {
		parentNode.childNodes.splice(index, 1);
	}
	return parentNode;
}

function findScriptTargetElement(attrs: any) {
	for (const attr of attrs) {
		if (attr.name == "head" || attr.name == "body") {
			return attr.name;
		}
		return false;
	}
}

function findDataToObject(data: any) {
	let strData = data[0].value
		.replace(/,/g, `,"`)
		.replace(/=/g, `":`)
		.replace(/[\n\r\s]/g, "")
		.replace(/'/g, `"`);
	strData = `{"${strData}}`;
	return JSON.parse(strData);
}

function partialElementBox(html: string) {
	let lData;
	var parentNode = parseFragment(html);
	var body = "";
	var labelAdd: any = {
		link: [],
		script: [],
		style: [],
	};
	for (const Node of parentNode.childNodes) {
		if (Node.nodeName == "lcode") {
			parentNode = findAndRemoveElement(Node, Node.parentNode);
			lData = findDataToObject(Node.childNodes);
		}
		if (Node.nodeName == "link") {
			parentNode = findAndRemoveElement(Node, Node.parentNode);
			labelAdd.link.push({
				index: "head",
				Node: Node,
			});
		}
		if (Node.nodeName == "script") {
			const localtion = findScriptTargetElement(Node.attrs);
			console.log(localtion);
			if (localtion) {
				parentNode = findAndRemoveElement(Node, Node.parentNode);
				let topScript = serializeOuter(Node)
					.replace(` ${localtion}=''`, "")
					.replace(` ${localtion}=""`, "");
				labelAdd.script.push({
					index: localtion,
					Node: parseFragment(topScript).childNodes[0],
				});
			}
		}
		if (Node.nodeName == "style") {
			parentNode = findAndRemoveElement(Node, Node.parentNode);
			labelAdd.link.push({
				index: "head",
				Node: Node,
			});
		}
	}

	body = serialize(parentNode);

	var lCode = {
		...lData,
		body,
	};
	return {
		labelAdd,
		lCode,
	};
}

function addElementToLayout(nodes: any, layout: any) {
	const html = layout.childNodes[1].childNodes;
	for (const node of nodes) {
		const targetNode = html.find((t: any) => t.nodeName === node.index);
		targetNode.childNodes.push(node.Node);
	}
	return layout;
}

async function replaceHtml(path: string, partialHtml: any) {
	const layoutPage = await readFile(path, { encoding: "utf-8" });
	var layoutNodes = parse(layoutPage);
	layoutNodes = addElementToLayout(partialHtml.labelAdd.link, layoutNodes);
	layoutNodes = addElementToLayout(partialHtml.labelAdd.script, layoutNodes);
	layoutNodes = addElementToLayout(partialHtml.labelAdd.style, layoutNodes);
	var layoutNodeToString = serialize(layoutNodes);
	const template = Handlebars.compile(layoutNodeToString);
	return template(partialHtml.lCode);
}

let CreatHtmlLayout = (Options: Options) => {
	return {
		transformIndexHtml: {
			enforce: "pre",
			transform: (html: string) => {
				const partial = partialElementBox(html);
				return replaceHtml(Options.layoutUrl, partial);
			},
		},
	};
};

const result: any = {};
let CheckPath = async function (path: string) {
	const dir = await readdir(path, { withFileTypes: true });
	for (let d of dir) {
		if (d.isDirectory()) {
			await CheckPath(resolve(path, d.name));
		} else {
			result[d.name.split(".")[0]] = resolve(path, d.name);
		}
	}
	return result;
};

export { CreatHtmlLayout, CheckPath };
