/*
 * @Author: Anonymous-CZ
 * @Date: 2026-01-18 14:12:01
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-01-18 15:27:36
 * @FilePath: src/author.ts
 * @Description: 原始作者名称选择与兜底逻辑。
 */

/**
 * 根据“Git 原始作者/当前 Git 用户名/兜底值”选择最终写入文件头的作者名称。
 *
 * 选择优先级（从高到低）：
 * 1) `gitOriginalAuthor`（来自 git log 的最早提交作者）
 * 2) `currentGitUserName`（来自 git config user.name）
 * 3) `unknownAuthorFallback`（默认 `Unknown Author`）
 *
 * 所有输入都会先 `trim()`：空字符串视为无效。
 *
 * @param input 选择作者所需的候选信息
 * @returns 最终用于写入文件头的作者名称
 */
export function pickAuthor(input: {
	gitOriginalAuthor: string;
	currentGitUserName: string;
	unknownAuthorFallback?: string;
}): string {
	const unknownAuthorFallback = input.unknownAuthorFallback ?? 'Unknown Author';
	const gitOriginalAuthor = input.gitOriginalAuthor.trim();
	if (gitOriginalAuthor) {
		return gitOriginalAuthor;
	}
	const currentGitUserName = input.currentGitUserName.trim();
	if (currentGitUserName) {
		return currentGitUserName;
	}
	return unknownAuthorFallback;
}
