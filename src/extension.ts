import * as vscode from 'vscode';
import { exec } from 'child_process'; // 用于执行Git命令
import { promisify } from 'util'; // 将回调函数转为Promise
import { stat } from 'fs/promises';
import { formatLocalDateTime, parseLocalDateTimeString, pickEarliestDate } from './dateTime';
import { getUnknownFileBehavior, resolveCommentStyle, type CommentStyle, type CommentStyleConfig, type UnknownFileBehavior } from './commentStyle';
import { renderHeaderBodyLines, wrapWithComment } from './header';
import { pickAuthor } from './author';
const execAsync = promisify(exec); // 异步执行命令
// 新增：定义一个接口来规范返回的数据结构
interface GitCommitInfo {
	author: string;
	date: string; // 格式化为 'YYYY-MM-DD HH:mm:ss'
}

async function getCurrentGitUserName(): Promise<string> {
	try {
		const { stdout } = await execAsync('git config user.name', { cwd: vscode.workspace.rootPath });
		return stdout.trim();
	} catch {
		return '';
	}
}

function readCommentStyleConfig(): CommentStyleConfig {
	const config = vscode.workspace.getConfiguration('git-original-author-header');
	return {
		commentStyleByLanguage: config.get<Record<string, CommentStyle>>('commentStyleByLanguage'),
		commentStyleByExtension: config.get<Record<string, CommentStyle>>('commentStyleByExtension'),
		unknownFileBehavior: config.get<UnknownFileBehavior>('unknownFileBehavior'),
	};
}

async function getFileBirthTime(filePath: string): Promise<Date | null> {
	try {
		const stats = await stat(filePath);
		const birthtime = stats.birthtime;
		if (!birthtime || Number.isNaN(birthtime.getTime()) || birthtime.getTime() === 0) {
			return null;
		}
		return birthtime;
	} catch {
		return null;
	}
}
// 修改函数：同时获取原始作者和提交时间
async function getOriginalGitCommitInfo(filePath: string): Promise<GitCommitInfo> {
	return new Promise((resolve) => {
		// 关键命令：同时获取作者(%an)和提交时间(%ad)，时间格式已指定
		const command = `git --no-pager log --reverse --pretty=format:"%an|||%ad" --date=format:"%Y-%m-%d %H:%M:%S" -1 -- "${filePath.replace(/"/g, '\\"')}"`;

		exec(command, { cwd: vscode.workspace.rootPath }, (error, stdout, stderr) => {
			const trimmed = stdout?.trim() ?? '';
			if (trimmed) {
				const delimiter = '|||';
				const delimiterIndex = trimmed.indexOf(delimiter);
				if (delimiterIndex >= 0) {
					const author = trimmed.slice(0, delimiterIndex).trim();
					const date = trimmed.slice(delimiterIndex + delimiter.length).trim();
					console.log(`成功获取原始提交信息 - 作者: ${author}, 时间: ${date}`);
					resolve({ author, date });
					return;
				}

				// Unexpected format; still return something sane.
				resolve({ author: trimmed, date: '' });
				return;
			}

			console.error('无法获取原始提交信息:', error?.message || stderr);
			// 对未跟踪/无历史文件，stdout 为空：让后续逻辑做兜底选择。
			resolve({ author: '', date: '' });
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
		const languageId = document.languageId;
		const commentStyleConfig = readCommentStyleConfig();
		const resolved = resolveCommentStyle({ languageId, fileName: filePath, config: commentStyleConfig });
		if (resolved.reason === 'noCommentLanguage') {
			vscode.window.showWarningMessage('该文件类型不支持注释（例如 JSON）。已跳过插入文件头。你可以在设置中为该类型指定注释风格，或改用支持注释的语言模式（如 JSONC）。');
			return;
		}
		let chosenCommentStyle = resolved.style;
		if (!chosenCommentStyle) {
			const unknownBehavior = getUnknownFileBehavior(commentStyleConfig);
			if (unknownBehavior === 'skip') {
				vscode.window.showWarningMessage(`无法判断该文件的注释方式（languageId=${languageId}）。已跳过插入；可在设置中配置 commentStyleByLanguage/commentStyleByExtension。`);
				return;
			}
			if (unknownBehavior === 'fallback') {
				chosenCommentStyle = 'cBlock';
			} else {
				const picked = await vscode.window.showQuickPick(
					[
						{ label: 'C 块注释', description: '/* ... */', style: 'cBlock' as const },
						{ label: 'HTML 注释', description: '<!-- ... -->', style: 'htmlBlock' as const },
						{ label: '双斜杠行注释', description: '// ...', style: 'slashLine' as const },
						{ label: '井号行注释', description: '# ...', style: 'hashLine' as const },
						{ label: 'PowerShell 块注释', description: '<# ... #>', style: 'powershellBlock' as const },
						{ label: 'Lua 块注释', description: '--[[ ... ]]', style: 'luaBlock' as const },
					],
					{ title: '无法自动识别注释方式，请选择一种用于插入文件头' }
				);
				if (!picked) {
					return;
				}
				chosenCommentStyle = picked.style;
			}
		}
		const currentGitUserName = await getCurrentGitUserName();

		// 获取原始提交信息（作者 + 时间）
		const originalCommitInfo = await getOriginalGitCommitInfo(filePath);
		const originalAuthor = pickAuthor({
			gitOriginalAuthor: originalCommitInfo.author,
			currentGitUserName,
		});
		const gitOriginalDateString = originalCommitInfo.date;
		const gitOriginalDate = parseLocalDateTimeString(gitOriginalDateString);

		const fileBirthTime = await getFileBirthTime(filePath);
		const chosenDate = pickEarliestDate(gitOriginalDate, fileBirthTime) ?? parseLocalDateTimeString('1970-01-01 00:00:00')!;
		const chosenDateString = formatLocalDateTime(chosenDate);

		// 获取当前用户和当前时间
		const lastEditor = currentGitUserName || 'Current User';

		const currentDateTime = formatLocalDateTime(new Date());

		// 获取文件路径
		const relativeFilePath = vscode.workspace.asRelativePath(filePath);

		const headerLines = renderHeaderBodyLines({
			author: originalAuthor,
			date: chosenDateString,
			lastEditors: lastEditor,
			lastEditTime: currentDateTime,
			filePath: relativeFilePath,
			description: '',
		});
		const header = wrapWithComment(chosenCommentStyle, headerLines) + '\n';

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