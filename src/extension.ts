import * as vscode from 'vscode';
import { exec } from 'child_process'; // 用于执行Git命令
import { promisify } from 'util'; // 将回调函数转为Promise
const execAsync = promisify(exec); // 异步执行命令

// 核心函数：获取文件的原始Git作者
async function getOriginalGitAuthor(filePath: string): Promise<string> {
  try {
    // 关键命令：获取文件的第一条提交记录的作者名
    // --reverse: 反向排序，让最早提交排在最前
    // --pretty=format:'%an': 只输出作者姓名
    const { stdout } = await execAsync(
      `git log --reverse --pretty=format:'%an' -- "${filePath}" | head -1`,
      { cwd: vscode.workspace.rootPath } // 在项目根目录执行
    );
    const author = stdout.trim();
    // 如果成功获取到，则返回；否则返回占位符
    return author || 'Unknown Original Author';
  } catch (error) {
    // 如果出错（如文件未纳入Git管理），则返回占位符
    console.error('获取Git原始作者失败:', error);
    return 'Unknown Original Author (Check Git History)';
  }
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

    // 获取原始Git作者
    const originalAuthor = await getOriginalGitAuthor(filePath);
    // 获取当前用户（最后编辑者）
    const lastEditor = await execAsync('git config user.name').then(res => res.stdout.trim()).catch(() => 'Current User');

    // 构建你想要的文件头内容
    // 这里使用了VSCode自带的时间变量，你也可以用 new Date() 生成
    const header = `/**
 * 原始作者: ${originalAuthor}
 * 创建日期: \${CURRENT_YEAR}-\${CURRENT_MONTH}-\${CURRENT_DATE}
 * 最后编辑者: ${lastEditor}
 * 最后编辑时间: \${CURRENT_YEAR}-\${CURRENT_MONTH}-\${CURRENT_DATE} \${CURRENT_HOUR}:\${CURRENT_MINUTE}:\${CURRENT_SECOND}
 * 文件路径: ${vscode.workspace.asRelativePath(filePath)}
 * 描述: 
 */
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
export function deactivate() {}