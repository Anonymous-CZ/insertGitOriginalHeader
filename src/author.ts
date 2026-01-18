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
