import { readdir } from "fs/promises";
import { resolve } from "path";
async function CheckPath(path: any, result: any = {}) {
	const dir = await readdir(path, { withFileTypes: true });
	for (let d of dir) {
		if (d.isDirectory()) {
			await CheckPath(resolve(path, d.name), result);
		} else {
			result[d.name.split(".")[0]] = resolve(path, d.name);
		}
	}
	return result;
}

export default CheckPath;
