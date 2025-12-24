import type { FC } from 'react';

export interface MarkdownEditorProps {
	value: string;
	onChange: (value: string) => void;
}

const MarkdownEditor: FC<MarkdownEditorProps> = ({ value, onChange }) => {
	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between rounded-t-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
				<p className="font-medium">
					編輯模式：使用 Markdown 格式修改 (<code># 題目</code>, <code>- 評語</code>)
				</p>
				<p className="text-xs opacity-70">點擊「完成」自動儲存</p>
			</div>
			<textarea
				className="flex-1 resize-none rounded-b-lg border border-blue-200 bg-white p-4 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="# Title..."
				autoFocus
			/>
		</div>
	);
};

export default MarkdownEditor;
