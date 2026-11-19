# Photo Tool 使用说明

这是 zizyfuz 网站的本地照片更新工具。它只在你的电脑上运行，不会部署到线上网站。

## 1. 启动工具

最简单的方式：在项目文件夹里双击：

```text
Start Photo Tool.cmd
```

它会自动打开浏览器。使用工具时，请不要关闭弹出的命令窗口；关闭窗口就等于停止本地工具。

也可以手动在项目文件夹里打开 PowerShell，运行：

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run photo-tool
```

看到类似下面这行后，不要关闭这个 PowerShell 窗口：

```text
Photo tool running at http://127.0.0.1:5174
```

然后在浏览器打开：

```text
http://127.0.0.1:5174
```

## 2. 配置 AI 识别

如果要让工具自动识别标题和分类，在项目根目录新建 `.env.local`：

```text
OPENAI_API_KEY=你的 OpenAI API key
```

`.env.local` 已经被 `.gitignore` 忽略，不会提交到 GitHub。

如果没有配置 API key，工具仍然可以用，但会根据文件名生成初稿，需要你手动检查标题和分类。

## 3. 更新照片流程

1. 把照片拖到工具页面，或点击“选择照片”。
2. 检查预览图、标题、分类、slug。
3. 如果出现相似照片提醒，先人工确认是否仍然添加。
4. 点击“应用到本地网站”。
5. 点击“运行 build 检查”。
6. build 通过后，点击“提交并推送 GitHub”。

工具只保存网页用 JPG 到 `public/photos-web/`，不会保存原始大图。
