# zizyfuz_website Agent Notes

给之后进入本项目的 Codex / AI 助手读取。用户是 Lin，熟悉基础 Python/数据分析，但 Git/GitHub、Node.js、前端经验较少。请用初学者友好的中文解释命令、概念和风险，步骤要清楚。

## 绝对删除规则

禁止批量删除文件或目录。不要使用：

```powershell
del /s
rd /s
rmdir /s
Remove-Item -Recurse
rm -rf
```

如需删除，只能一次删除一个明确路径的文件；如果需要批量删除，停止并请用户手动处理。

## 项目现状

- 项目：React + Vite 摄影作品集网站 `zizyfuz_website`
- 远程仓库：`https://github.com/Safiier/zizyfuz_website.git`
- 正式地址：`https://zizyfuz.com/photography/`
- GitHub Pages：`https://safiier.github.io/zizyfuz_website/`
- 部署：push 到 `main` 后由 `.github/workflows/deploy.yml` 自动构建并部署
- 当前 SEO 状态：Google 搜索 `zizyfuz` 已能排第一；`index.html` 已设置 `Zizyfuz Photography`、favicon、Open Graph/Twitter 预览图，预览图为 `old-harry.jpg`

## 当前设计与内容

- 风格：极简、干净、有质感的摄影作品集；背景以白色/off-white 为主
- Home：全屏摄影首页，导航围绕 logo；滚到 About 后导航淡出
- About：左图右文，文案为：

```text
"You are the first audience of your own life."

I lived in Chongqing, Singapore, and currently pursuing a degree in the UK. Photography is the channel that allows me to explore the world and myself.
```

- Gallery：直接展示所有照片；不要重新加入分类筛选、照片计数、单张标题覆盖，除非用户明确要求
- Contact：`zizyfuz@gmail.com`，Instagram 和 Xiaohongshu 已有链接
- Logo：页面使用 `public/logo-zizyfuz-mark.png`；不要改源 logo，除非用户明确要求

## 关键文件

- `index.html`：标题、描述、favicon、搜索/社交预览 meta
- `src/App.jsx`：页面结构、导航、Home/About/Gallery/Contact、lightbox
- `src/styles.css`：主要视觉样式和响应式布局
- `src/data/photos.js`：照片清单；新增照片主要改这里
- `public/photos-web/`：网页实际加载的优化图片
- `photos/`：原始照片，本地保留，通常不要提交
- `vite.config.js`：`base: '/photography/'`，不要随意改
- `tools/prepare-pages.mjs`：构建后生成 `dist/CNAME` 和根路径跳转
- `tools/photo-tool/`：本地照片添加工具

## 常用命令

本机 `npm` 和 `git` 可能不在 PATH 中，优先用完整路径：

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install
& 'C:\Program Files\nodejs\npm.cmd' run dev
& 'C:\Program Files\nodejs\npm.cmd' run build
& 'C:\Program Files\Git\cmd\git.exe' status --short --branch
```

如果 Vite/esbuild 出现 `spawn EPERM`，通常是 Windows 沙盒权限问题；请请求用户授权后重跑同一条命令。

## 维护偏好

- 保持作品集气质，不做营销型 landing page
- 不要提交 `node_modules/`、`dist/`、日志文件或 `photos/` 原始大图
- 新增照片：原图放 `photos/`，网页优化版放 `public/photos-web/`，再更新 `src/data/photos.js`，最后运行 build
- 不要绕过 `assetPath` / `import.meta.env.BASE_URL`，否则 GitHub Pages 子路径可能导致图片加载失败
- 不要 reset、checkout 或 revert 用户已有改动；先理解再协同处理
- 编辑文件优先使用 `apply_patch`；搜索优先使用 `rg` / `rg --files`
