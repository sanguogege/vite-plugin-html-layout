# vite-plugin-html-layout

### 此插件专用于vite

## 安装

`npm i vite-plugin-html-layout`

## 使用
- 指定一个html页面为模板页。
- 指定一个文件夹为存放具体页面地方。
- 页面解析基于 parse5.js
- 页面插入基于 handlebars.js

vite.config.js

```ts
import { defineConfig } from "vite";
import { resolve } from "path";

import CreatHtmlLayout from "./plugin";

export default defineConfig({
	root: "src",
	plugins: [
		CreatHtmlLayout({
			template: resolve(__dirname, "index.html"),
			components: resolve(__dirname, "components/"),
		}),
	],
	publicDir: resolve(__dirname, "public"),
	build: {
		outDir: resolve(__dirname, "dist"),
		emptyOutDir: true,
	},
});

```
- CreatHtmlLayout
---- 'template'  <strong>必须项目：</strong>指定具体页面为模板页面。
---- 'components'  <strong>可选项目：</strong>指定components的存放路径。

- 'root' <strong>必须项目：</strong>为具体页面存放路径，此为vite的根目录设置。

- 'publicDir' 公共文件夹，尽量不要放在root里，影响打包效果。
--- 你可以直接在项目文件夹里访问里面的js、css、image等等，例如：
 `<link rel="stylesheet" href="/css/public.css">` 
 表示 文件夹publicDir => css文件夹 =>public.css。

- 'outDir' 为打包后的存放目录，由于'root'指定了文件夹，所以'outDir'是相对'root'的相对路径。




layout.html

```html
<!DOCTYPE html>
<html lang="zh">

<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="keywords" content="{{keyword}}">
    <meta name="description" content="{{description}}">
    <link rel="stylesheet" href="./css/public.css">
</head>

<body>
    {{{body}}}
    <script src='/js/jquery.js'></script>
</body>

</html>
```

/src/index.html
```html
<lcode>
    title="首页",
    keyword="asdasdasd",
    description="这是描述"
</lcode>
<link rel="stylesheet" href="/css/public.css">
<link rel="stylesheet" href="/css/swiper.css">
<div class="aa">
    <script> for (var i = 2010; i <= 2029; i++) {
            document.write('<span id="ST' + i + '">' + i + '年</span>');
        }</script>
    qaawe
</div>
<script head src='/js/aa.js'></script>
<script body>
    var xx = $(".aa").html()
    console.log(xx);
</script>

<style>
    .aa {
        color: red;
    }
</style>

```
- lcode标签：用于值替换，每一个必须','隔开。xx='xx'的格式
- link标签：会按顺序添加的head的尾部，可以随意置放，但限于无外部标签。
- script标签：添加head表示 按顺序添加head的尾部，添加body表示 按顺序添加body的尾部，无添加的script则保持在文件中本来的位置。
- style标签：会按顺序添加的head的尾部并保持在link之后，可以随意置放，但限于无外部标签。


components/test.html

```html

<b>这是组件中的test.html</b>
<script body src="/js/jqueryjs"></script>

```
- 除了不支持lcode标签，其他的和template页面用法一样。
- components尽量在template页面里使用。
- 在layout页面里，只会解析成html，对script、link、style不做出任何处理。



