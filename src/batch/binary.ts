/*
 * @Author: Anonymous-CZ
 * @Date: 2026-05-14 11:01:05
 * @LastEditors: Anonymous-CZ
 * @LastEditTime: 2026-05-14 11:07:06
 * @FilePath: /insertGitOriginalHeader/src/batch/binary.ts
 * @Description: 二进制文件的保守检测（用于批量模式跳过）
 */
import { open } from 'fs/promises';

const DEFAULT_SAMPLE_BYTES = 8192;

/**
 * 基于文件前若干字节做保守二进制检测。
 *
 * 规则（保守）：
 * - 包含 NUL（0x00）直接视为二进制
 * - 控制字符比例过高（不含常见空白）视为二进制
 */
export async function isProbablyBinaryFile(filePath: string, sampleBytes: number = DEFAULT_SAMPLE_BYTES): Promise<boolean> {
	try {
		const handle = await open(filePath, 'r');
		try {
			const bytesToRead = Math.max(1, Math.min(1024 * 1024, Math.floor(sampleBytes)));
			const buffer = Buffer.alloc(bytesToRead);
			const { bytesRead } = await handle.read(buffer, 0, bytesToRead, 0);
			if (bytesRead <= 0) {
				return false;
			}

			let suspicious = 0;
			for (let i = 0; i < bytesRead; i++) {
				const byte = buffer[i];
				if (byte === 0) {
					return true;
				}
				// allow: \t \n \r
				const isAllowedWhitespace = byte === 9 || byte === 10 || byte === 13;
				// allow printable ASCII and common UTF-8 bytes (>=0x20)
				const isPrintable = byte >= 32;
				if (!isAllowedWhitespace && !isPrintable) {
					suspicious++;
				}
			}

			return suspicious / bytesRead > 0.3;
		} finally {
			await handle.close();
		}
	} catch {
		// 读不到就当成非二进制，让上层按“读文件失败/无法写入”处理。
		return false;
	}
}
