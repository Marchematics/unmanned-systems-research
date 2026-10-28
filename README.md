# 空天地无人系统协同控制团队网站

静态网站，直接打开 `index.html` 预览，通过 GitHub Pages 发布。团队介绍和论文清单依据团队演示材料整理；论文的作者、期刊、年份及 DOI 参考 OpenAlex、Crossref、期刊出版社与高校论文资料库核对。演示材料中的重复论文已去重；`data/publications.json` 保存所列论文的元数据。

页面编辑直接修改 `index.html`；样式和脚本的源文件为 `style.css`、`script.js`。修改样式或脚本后，在本目录运行 `python3 update_assets.py`，生成带内容指纹的资源文件并更新页面引用，以避免浏览器混用新旧文件。图片来自团队提供的演示材料。后续更新请团队核对成员信息、成果及图片的公开授权。
