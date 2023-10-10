import { readFile, readdir } from "fs/promises";
import { resolve } from "path";
import { parse, parseFragment, serialize } from "parse5";
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
	let attrLocaltion: any = {
		location: -1,
		index: false,
	};
	for (const i in attrs) {
		if (attrs[i].name == "head" || attrs[i].name == "body") {
			attrLocaltion.location = i;
			attrLocaltion.index = attrs[i].name;
		}
	}
	return attrLocaltion;
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

function sortElement(nodes: any) {
	const orderArray = ["link", "style", "script"];
	return nodes.sort((pre: any, next: any) => {
		const pretag = pre.Node.nodeName;
		const nexttag = next.Node.nodeName;

		const indexpre = orderArray.indexOf(pretag);
		const indexnext = orderArray.indexOf(nexttag);

		return indexpre - indexnext;
	});
}

function addElementToLayout(nodes: any, layout: any) {
	const html = layout.childNodes[1].childNodes;
	const newNodes = sortElement(nodes);
	for (const node of newNodes) {
		const targetNode = html.find((t: any) => t.nodeName === node.index);
		targetNode.childNodes.push(node.Node);
	}
	return layout;
}

function partialElementBox(html: string) {
	let lData;
	var parentNode = parseFragment(html);
	var body = "";
	var labelAdd = [];
	for (const Node of parentNode.childNodes) {
		if (Node.nodeName == "lcode") {
			parentNode = findAndRemoveElement(Node, Node.parentNode);
			lData = findDataToObject(Node.childNodes);
		}
		if (Node.nodeName == "link" || Node.nodeName == "style") {
			parentNode = findAndRemoveElement(Node, Node.parentNode);
			labelAdd.push({
				index: "head",
				Node: Node,
			});
		}
		if (Node.nodeName == "script") {
			const attrLocaltion = findScriptTargetElement(Node.attrs);
			if (attrLocaltion.index) {
				parentNode = findAndRemoveElement(Node, Node.parentNode);
				Node.attrs.splice(attrLocaltion.location, 1);
				labelAdd.push({
					index: attrLocaltion.index,
					Node: Node,
				});
			}
		}
	}
	body = serialize(parentNode);

	let lCode = {
		...lData,
		body,
	};
	return {
		labelAdd,
		lCode,
	};
}

async function replaceHtml(path: string, partialHtml: any) {
	const layoutPage = await readFile(path, { encoding: "utf-8" });
	var layoutNodes = parse(layoutPage);
	layoutNodes = addElementToLayout(partialHtml.labelAdd, layoutNodes);
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
