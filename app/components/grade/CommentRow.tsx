import deleteIcon from '@iconify-icons/mdi/close-circle-outline';
import { Icon } from '@iconify/react';
import type { FC } from 'react';
import AutoTextarea from '~/components/common/AutoTextarea';
import type { Comment } from '~/models';

export interface CommentRowProps {
	comment: Comment;
	checked: boolean;
	locked: boolean;

	onToggle: (checked: boolean) => void;
	onEdit: (patch: Partial<Comment>) => void;
	onRemove: () => void;
}

/**
 * A single comment row. Includes: checkbox, text, deduction, delete button. Auto-resizing text area, vertically
 * centered.
 */
const CommentRow: FC<CommentRowProps> = ({ comment, checked, locked, onToggle, onEdit, onRemove }) => {
	return (
		<div className="flex items-center gap-3 rounded-md border border-gray-100 bg-white px-3 py-2">
			{/* Checkbox */}
			<input
				type="checkbox"
				checked={checked}
				disabled={locked}
				onChange={(e) => onToggle(e.target.checked)}
				className="h-4 w-4 accent-blue-600 disabled:cursor-not-allowed"
			/>

			{/* Comment Text */}
			<div className="flex min-w-0 flex-1 items-center">
				<AutoTextarea
					value={comment.text}
					onChange={(val) => onEdit({ text: val })}
					placeholder="輸入評語…"
					className="text-gray-800"
				/>
			</div>

			{/* Deduction */}
			<input
				type="number"
				value={comment.deduction ?? 0}
				onChange={(e) => onEdit({ deduction: Number(e.target.value) || 0 })}
				placeholder="0"
				className="w-16 rounded-md border border-gray-300 px-2 py-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
			/>

			{/* Delete */}
			<button onClick={onRemove} className="text-gray-400 hover:text-red-500 disabled:opacity-40" title="刪除評語">
				<Icon icon={deleteIcon} className="text-xl" />
			</button>
		</div>
	);
};

export default CommentRow;
