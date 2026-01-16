import * as vscode from 'vscode';
import { exec } from 'child_process'; // 用于执行Git命令
import { promisify } from 'util'; // 将回调函数转为Promise
const execAsync = promisify(exec); // 异步执行命令
// 新增：定义一个接口来规范返回的数据结构
interface GitCommitInfo {
	author: string;
	date: string; // 格式化为 'YYYY-MM-DD HH:mm:ss'
}
// 修改函数：同时获取原始作者和提交时间
async function getOriginalGitCommitInfo(filePath: string): Promise<GitCommitInfo> {
	return new Promise((resolve) => {
		// 关键命令：同时获取作者(%an)和提交时间(%ad)，时间格式已指定
		const command = `git --no-pager log --reverse --pretty=format:"%an|||%ad" --date=format:"%Y-%m-%d %H:%M:%S" -1 -- "${filePath.replace(/"/g, '\\"')}"`;

		exec(command, { cwd: vscode.workspace.rootPath }, (error, stdout, stderr) => {
			if (stdout && stdout.trim()) {
				const [author, date] = stdout.trim().split('|||');
				console.log(`成功获取原始提交信息 - 作者: ${author}, 时间: ${date}`);
				resolve({ author: author || 'Unknown', date: date || 'Unknown Date' });
			} else {
				console.error('无法获取原始提交信息:', error?.message || stderr);
				// 返回兜底值
				resolve({ author: 'Unknown Author', date: '1970-01-01 00:00:00' });
			}
		});
	});
}

// 插件激活时执行的函数
export function activate(context: vscode.ExtensionContext) {
	// 注册一个命令，命令ID需与package.json中一致
	let disposable = vscode.commands.registerCommand('git-original-author-header.insertGitOriginalHeader', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('没有活跃的编辑器窗口！');
			return;
		}

		const document = editor.document;
		const filePath = document.fileName;
		// 获取原始提交信息（作者 + 时间）
		const originalCommitInfo = await getOriginalGitCommitInfo(filePath);
		const originalAuthor = originalCommitInfo.author;
		const originalDate = originalCommitInfo.date;

		// 获取当前用户和当前时间
		let lastEditor = 'Current User';
		try {
			const { stdout } = await execAsync('git config user.name', { cwd: vscode.workspace.rootPath });
			lastEditor = stdout.trim();
		} catch (error) {
			// 如果获取失败，就使用默认值
		}

		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');
		const currentDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

		// 获取文件路径
		const relativeFilePath = vscode.workspace.asRelativePath(filePath);

		// 构建注释模板 - 现在 @Date 使用原始提交时间
		const header = `<!--
 * @Author: ${originalAuthor}
 * @Date: ${originalDate}
 * @LastEditors: ${lastEditor}
 * @LastEditTime: ${currentDateTime}
 * @FilePath: ${relativeFilePath}
 * @Description: 
-->
`;

		// 将文件头插入到编辑器的最顶部
		editor.edit(editBuilder => {
			editBuilder.insert(new vscode.Position(0, 0), header);
		});

		vscode.window.showInformationMessage('已插入包含原始Git作者的文件头！');
	});

	// 将命令注册到订阅中，以便插件卸载时清理
	context.subscriptions.push(disposable);
}

// 插件停用时执行的函数（可选）
export function deactivate() { }