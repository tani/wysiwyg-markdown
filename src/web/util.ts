/**
 * Normalizes Markdown text for comparison between VS Code and Vditor.
 * 
 * Specifically:
 * 1. Converts CRLF (\r\n) to LF (\n).
 * 2. Removes exactly one trailing newline if present, to handle Vditor/VS Code differences 
 *    in end-of-file newline handling.
 * 
 * @param str The string to normalize.
 * @returns The normalized string.
 */
export function normalize(str: string): string {
    return str.replace(/\r\n/g, '\n').replace(/\n+$/, '');
}
