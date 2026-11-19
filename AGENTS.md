# zizyfuz_website Agent Notes

给之后进入本项目的 Codex / Claude / 其他 AI 助手读取。用户是 Lin，熟悉基础 Python/数据分析，但 Git/GitHub、Node.js、前端经验较少。请用初学者友好的中文解释命令、概念和风险，步骤要清楚。

> 2026-11 改版后更新。下面「用户已定下的要求」是用户逐条确认过的，**不要擅自改回去**；要改先问用户。

## 绝对规则

1. **禁止批量删除文件或目录。** 不要使用 `del /s`、`rd /s`、`rmdir /s`、`Remove-Item -Recurse`、`rm -rf`。如需删除，只能一次删除一个明确路径的文件；需要批量删除时，停止并请用户手动处理。
2. **`G:\摄影` 是用户的摄影原片库，只读。** 绝不修改、移动、重命名、删除其中任何文件。处理图片时只读取，输出写到本项目的 `public/photos-web/`。
3. 不要 reset、checkout 或 revert 用户已有的改动；先理解再协同处理。
4. 不要提交 `node_modules/`、`dist/`、日志文件或 `photos/` 原始大图。

## 项目现状

- 项目：React 19 + Vite 7 摄影作品集网站
- 远程仓库：`https://github.com/Safiier/zizyfuz_website.git`
- 正式地址：`https://zizyfuz.com/photography/`
- 部署：push 到 `main` 后由 `.github/workflows/deploy.yml` 自动构建并部署
- 改版前的线上版本：tag `v1-live-2026-11-19`（随时可以回到它）
- 改版开发分支：`redesign`

## 页面结构

- **Home**：全屏轮播（`hero: 1–4` 的 4 张），每次打开网页随机从其中一张开始，每 8 秒自动切换（鼠标在图上也继续播放）；鼠标移到左右两侧才出现箭头；手机可左右滑动。
- **About**：左图右文，配图是 `genyen-walking-on`（格聂，用户 2026-11-19 指定，图框按照片原比例显示）。文案是用户原文，逐字保留：

  > “You are the first audience of your own life.”
  >
  > I have lived in Chongqing, Singapore, and currently pursuing a degree in the UK. I plan the journeys and explore the vast world through road trips. Let photography be the channel that guides you to view the world and yourself.

- **Gallery 区（`#gallery`）**：先是 **Series** 卡片（封面 + 标题 + 年份），再是 **Selected Works**（`featured: true` 的照片），最后是 “View all works” 链接。
- **系列页（`#series-<key>`）**：标题、年份、（介绍，目前为空）、该系列全部照片、上一个/下一个系列。
- **All Works（`#archive`）**：全部照片。
- **Contact**：`zizyfuz@gmail.com`、Instagram、Xiaohongshu。
- 导航：往下滚隐藏，往上滑浮出浅色细导航条。
- 页面切换（首页 ↔ 系列页 ↔ All Works）是瞬间定位，不能出现「先换页再一路滚动」的动画；只有同一页内的锚点跳转用平滑滚动（见 `useRoute()`）。
- 大图查看（lightbox）：照片下方只显示「地点 · 年份」，不显示标题；左右箭头是放在照片两侧空白处的小圆形按钮，不能遮住照片、不要整条灰色悬停区；手机隐藏箭头，左右滑动切换。

## 用户已定下的要求（不要改回去）

- **网页上任何地方都不显示作品数量**（不要 “18 photographs”、不要 “View all 118 works”）。
- Hero 下面**不要**显示第几张的圆点/进度条。
- **系列照片超过 12 张才有系列页**（`src/data/series.js` 的 `minSeriesSize = 12`）。
- **不做 Early Work & Others 系列**（`series: 'early'` 的照片只在 All Works 出现）。
- 系列介绍文字**目前留空**（`series.js` 里 `intro: ''`），等用户自己写。
- Series 区放在 Selected Works **前面**。
- 字体：Cormorant Garamond（标题/导航/正文衬线）+ Inter（小标签），用 @fontsource 自托管。
- 作品顺序是精心排的（`photos.js` 数组顺序 = 显示顺序），瀑布流必须按这个顺序从左到右、从上到下排列（`distributeIntoColumns()`），不要改回 CSS `column-count`。
- 风格：极简、干净、有质感，背景 off-white；不做营销型 landing page。
- Logo：页面使用 `public/logo-zizyfuz-mark.png`；favicon 是 `public/favicon.png`。不要改源 logo，除非用户明确要求。

## 关键文件

- `src/data/photos.js`：全部照片清单（顺序 = 显示顺序）。文件开头有字段说明。
- `src/data/series.js`：系列定义（标题、封面、介绍）和「超过 12 张才成系列」规则。
- `src/App.jsx`：页面结构、路由（hash）、轮播、导航、网格、lightbox。
- `src/styles.css`：全部样式和响应式布局。
- `public/photos-web/`：网页图片。每张照片 4 个文件：`<slug>-800.webp`、`<slug>-1600.webp`、`<slug>-2200.webp`、`<slug>.jpg`。
- `tools/add-photo.mjs`：加照片的命令（见下）。
- `tools/check-photos.mjs`：构建前自动检查每张照片的文件是否齐全，缺文件会让 build 失败。
- `tools/prepare-pages.mjs`：构建后生成 `dist/CNAME`、带图片的 `sitemap.xml`、`robots.txt`、根路径跳转。
- `index.html`：标题、描述、favicon、社交预览、JSON-LD 结构化数据。
- `vite.config.js`：`base: '/photography/'`，不要随意改。
- `tools/legacy/`：旧的 photo-tool 和 PowerShell 缩图脚本，**已停用，不要再用**（会写入旧格式）。

## 常用命令

本机 `npm` 和 `git` 可能不在 PATH 中，优先用完整路径：

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install
& 'C:\Program Files\nodejs\npm.cmd' run dev        # 本地预览 http://127.0.0.1:5173/photography/
& 'C:\Program Files\nodejs\npm.cmd' run build      # 先检查照片文件，再构建
& 'C:\Program Files\Git\cmd\git.exe' status --short --branch
```

如果 Vite/esbuild 出现 `spawn EPERM`，通常是 Windows 沙盒权限问题；请请求用户授权后重跑同一条命令。

## 添加新照片

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run add-photo -- `
  --file "G:\摄影\20260926 赤峰...\After\乌兰布统-2.jpg" `
  --slug ulan-butong-horses `
  --title "Horses on the Hill" `
  --place "Ulan Butong, Inner Mongolia" `
  --series northern-autumn `
  --alt "Horses grazing on a golden hillside" `
  --featured
```

- 只读取原图，自动生成 4 个网页文件，并从 EXIF（或「20260926 ...」这样的文件夹名）读出年份。
- 新照片加在 `photos.js` 列表末尾；要调整位置，就移动它在 `photos.js` 里的那一段。
- `--featured` 表示放进首页 Selected Works。
- 加 `--dry-run` 可以先看效果、不写任何文件。
- 加完后：`npm run build` → 本地预览检查 → commit。

## 维护偏好

- 不要绕过 `assetPath` / `import.meta.env.BASE_URL`，否则 GitHub Pages 子路径会导致图片加载失败。
- 大的改动先在分支上做，用户检查满意后再合并到 `main` 上线。
- 编辑文件优先使用 `apply_patch`；搜索优先使用 `rg` / `rg --files`。
