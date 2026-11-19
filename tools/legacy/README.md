# 旧工具（已停用）

这里的工具是 2026 年 5 月版本网站用的，**现在不要再用**：

- `photo-tool/`、`Start Photo Tool.cmd`：本地上传照片的网页工具。它写入的是旧数据格式（只有一张 jpg、有 `category` 字段），会和现在的网站结构冲突。
- `Optimize-Photo.ps1`：旧的 PowerShell 缩图脚本，只生成 jpg，不生成 WebP。

现在加照片请用项目根目录的：

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run add-photo -- --file "照片路径" --slug ... --title ... --alt ... --series ...
```

说明见 `tools/add-photo.mjs` 文件开头，或项目根目录的 `README.md`。

这些文件保留在这里只是为了留档；确认以后都用不到的话，可以手动删除这个文件夹。
