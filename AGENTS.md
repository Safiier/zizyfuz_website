# zizyfuz_website Agent Notes

本文件是给之后打开这个项目的 Codex / AI 助手读取的项目说明。请优先遵守这里的规则，再根据用户的新需求继续工作。

## 用户背景与沟通方式

- 用户是 Lin，熟悉基础 Python / 数据分析。
- 用户对 Git / GitHub、Node.js、前端开发经验较少。
- 解释命令、概念和风险时，请用初学者友好的中文，给出清晰步骤。
- 不要假设用户熟悉前端构建、GitHub Pages、DNS、自定义域名等概念。

## 绝对禁止的删除操作

禁止批量删除文件或目录。

不要使用：

```powershell
del /s
rd /s
rmdir /s
Remove-Item -Recurse
rm -rf
```

如果确实需要删除文件，只能一次删除一个明确路径的文件。  
如果需要批量删除文件，应停止操作，并请用户手动确认或手动删除。

## 项目概览

- 项目名称：`zizyfuz_website`
- 类型：React + Vite 摄影作品集网站
- 作者 / 摄影师名称：`zizyfuz`
- 远程仓库：`https://github.com/Safiier/zizyfuz_website.git`
- GitHub Pages 地址：`https://safiier.github.io/zizyfuz_website/`
- 自定义域名：`https://zizyfuz.com/photography/`
- 部署方式：GitHub Actions workflow 构建并部署到 GitHub Pages

主要功能：

- Home：全屏摄影首页，导航居中围绕 logo 排列。
- About：左侧照片，右侧摄影师介绍。
- Gallery：直接展示所有照片，无分类筛选、无照片计数、无单张标题覆盖。
- Contact：极简联系方式，当前邮箱为 `zizyfuz@gmail.com`，预留社交媒体文字位。
- Lightbox：点击照片可放大查看。

## 重要设计状态

当前设计偏向极简、干净、有质感的摄影作品集。

- 背景以舒适的白色 / off-white 为主。
- 首页导航只在 hero 区域明显出现，向下滚动到 About 后会淡出隐藏，避免干扰内容。
- 导航字体使用细致、字距较大的英文大写风格。
- Header logo 使用图片 mark，`zizyfuz` 名称是额外文本，不要直接烘焙进 logo，除非用户明确要求。
- Footer logo 当前为横向布局：logo 在左，`zizyfuz` 文本在右，字体比之前略大。

About 当前文案：

```text
"You are the first audience of your own life."

I lived in Chongqing, Singapore, and currently pursuing a degree in the UK. Photography is the channel that allows me to explore the world and myself.
```

Contact 当前状态：

```text
zizyfuz@gmail.com
Instagram
Xiaohongshu
```

## 常用命令

这个环境里 `npm` 和 `git` 可能不在 PATH 中，请优先使用完整路径。

安装依赖：

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install
```

本地预览：

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run dev
```

构建检查：

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run build
```

查看 Git 状态：

```powershell
& 'C:\Program Files\Git\cmd\git.exe' status --short --branch
```

提交示例：

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add AGENTS.md
& 'C:\Program Files\Git\cmd\git.exe' commit -m "Add project agent instructions"
& 'C:\Program Files\Git\cmd\git.exe' push
```

如果 Vite / esbuild 在沙盒里因为 `spawn EPERM` 或类似权限问题失败，说明可能需要让用户批准提升权限后再运行相同命令。

## 关键文件

- `src/App.jsx`：页面结构、导航、Home/About/Gallery/Contact、lightbox。
- `src/styles.css`：视觉样式、响应式布局、header 隐藏动画、footer 布局。
- `src/data/photos.js`：照片清单。新增照片主要改这里。
- `public/photos-web/`：网站实际加载的优化后图片。
- `photos/`：原始照片目录，本地保留，通常不提交到 Git。
- `public/logo_zizyfuz/`：用户准备的 logo 源文件。
- `public/logo-zizyfuz-mark.png`：当前网站实际使用的透明 logo mark。
- `.github/workflows/deploy.yml`：GitHub Pages 自动部署 workflow。
- `vite.config.js`：Vite 配置。当前 `base: '/photography/'` 且构建输出到 `dist/photography`，用于让摄影站运行在 `zizyfuz.com/photography/` 下，不要随意改掉。
- `tools/prepare-pages.mjs`：构建后生成 GitHub Pages 自定义域名所需的 `dist/CNAME`，并在 `dist/index.html` 放一个临时跳转到 `/photography/` 的首页。

## 照片更新流程

未来添加新照片时，建议保持这个流程：

1. 把原始照片放进 `photos/`。
2. 生成一张适合网页加载的优化版，放进 `public/photos-web/`。
3. 在 `src/data/photos.js` 的 `rawPhotos` 里添加一条照片记录。
4. 运行 build 检查。
5. commit 并 push 到 GitHub，GitHub Actions 会自动重新部署。

如果使用已有脚本优化单张照片，可以参考：

```powershell
.\tools\Optimize-Photo.ps1 -Source '.\photos\New Photo.jpg' -Target '.\public\photos-web\new-photo.jpg'
```

注意：一次处理一个明确的文件路径，避免批量删除或危险批处理。

`src/data/photos.js` 里照片路径应继续使用类似：

```js
{
  id: 'new-photo',
  filename: 'new-photo.jpg',
  title: 'New Photo',
  category: 'Landscape',
  orientation: 'landscape',
  featured: false,
  src: '/photos-web/new-photo.jpg',
}
```

不要绕过当前的 `assetPath` / `import.meta.env.BASE_URL` 逻辑，否则 GitHub Pages 子路径可能再次出现图片加载失败。

## Git 与部署注意事项

- 不要提交 `node_modules/`、`dist/`、日志文件或原始 `photos/` 大图。
- 修改代码后，尽量运行：

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run build
```

- 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动部署到 GitHub Pages。
- 只要仓库、GitHub Pages 设置、workflow 没被关闭或删除，网站会持续在线，不依赖用户本地电脑运行。
- 如果用户要自定义域名，需要在 GitHub Pages 设置中配置域名，并在域名服务商处配置 DNS。涉及最新 GitHub Pages DNS 记录时，请查询官方文档确认。

## 代码维护偏好

- 保持设计简洁，不要加入营销型 landing page。
- 不要重新加入 gallery 分类按钮、照片计数或每张图片标题覆盖，除非用户明确要求。
- 不要随意改变 logo 源文件；如需切换 logo，优先更换引用路径或生成一个新的明确输出文件。
- 不要改动原始照片。
- 如果工作区已有用户未提交的改动，不要 reset、checkout 或 revert，先理解并协同处理。
- 编辑文件优先使用 `apply_patch`。
- 搜索文件优先使用 `rg` 或 `rg --files`。
