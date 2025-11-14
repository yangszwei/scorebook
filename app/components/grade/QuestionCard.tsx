import CommentRow from './CommentRow';
import pencilIcon from '@iconify-icons/mdi/pencil';
import addIcon from '@iconify-icons/mdi/plus';
import deleteIcon from '@iconify-icons/mdi/trash-can-outline';
import { Icon } from '@iconify/react';
import type { FC } from 'react';
import { useState } from 'react';
import ConfirmModal from '~/components/common/ConfirmModel';
import type { Comment, Question, Submission } from '~/models';

export interface QuestionCardProps {
	question: Question;
	submission: Submission | null;

	locked: boolean;

	onRename: (title: string) => void;
	onRemove: () => void;

	onAddComment: () => void;
	onEditComment: (commentId: string, patch: Partial<Comment>) => void;
	onRemoveComment: (commentId: string) => void;
	onToggleComment: (commentId: string, checked: boolean) => void;
}

/**
 * A single question card. Includes question title, rename input, comment list, add comment button. Delete requires
 * confirmation.
 */
const QuestionCard: FC<QuestionCardProps> = ({
	question,
	submission,
	locked,

	onRename,
	onRemove,

	onAddComment,
	onEditComment,
	onRemoveComment,
	onToggleComment,
}) => {
	const [editing, setEditing] = useState(false);
	const [pendingTitle, setPendingTitle] = useState(question.title);
	const [openDelete, setOpenDelete] = useState(false);

	const selected = submission?.selected?.[question.id] ?? [];

	const commitRename = () => {
		onRename(pendingTitle.trim() || '未命名題目');
		setEditing(false);
	};

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
			{/* CONFIRM DELETE MODAL */}
			<ConfirmModal
				open={openDelete}
				title="刪除題目？"
				description="此動作無法復原，確認要刪除此題目嗎？"
				confirmText="刪除"
				onConfirm={() => {
					setOpenDelete(false);
					onRemove();
				}}
				onCancel={() => setOpenDelete(false)}
			/>

			{/* HEADER */}
			<div className="mb-4 flex h-8 items-center justify-between">
				{/* Title / Edit mode */}
				{!editing ? (
					<div className="flex h-full flex-1 cursor-text items-center" onClick={() => setEditing(true)}>
						<span className="flex h-full items-center text-lg font-semibold text-gray-800 select-none">
							{question.title || '（未命名題目）'}
						</span>

						<button
							className="ml-2 cursor-pointer text-gray-400 hover:text-gray-600"
							onClick={(e) => {
								e.stopPropagation();
								setEditing(true);
							}}
						>
							<Icon icon={pencilIcon} className="text-xl" />
						</button>
					</div>
				) : (
					<input
						autoFocus
						value={pendingTitle}
						onChange={(e) => setPendingTitle(e.target.value)}
						onBlur={commitRename}
						onKeyDown={(e) => {
							if (e.key === 'Enter') commitRename();
							if (e.key === 'Escape') setEditing(false);
						}}
						className="h-full w-full rounded-md border border-gray-300 px-2 py-0 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
						style={{ lineHeight: '32px' }}
					/>
				)}

				{/* DELETE */}
				<button onClick={() => setOpenDelete(true)} className="ml-3 cursor-pointer p-1 text-red-500 hover:text-red-600">
					<Icon icon={deleteIcon} className="text-xl" />
				</button>
			</div>

			{/* COMMENTS */}
			<div className="flex flex-col gap-3">
				{question.comments.length === 0 && <p className="text-sm text-gray-400 italic select-none">尚無評語</p>}

				{question.comments.map((c) => (
					<CommentRow
						key={c.id}
						comment={c}
						checked={selected.includes(c.id)}
						locked={locked}
						onToggle={(chk) => onToggleComment(c.id, chk)}
						onEdit={(patch) => onEditComment(c.id, patch)}
						onRemove={() => onRemoveComment(c.id)}
					/>
				))}
			</div>

			{/* ADD COMMENT */}
			<button
				onClick={onAddComment}
				className="mt-4 flex cursor-pointer items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
			>
				<Icon icon={addIcon} className="text-lg" />
				新增評語
			</button>
		</div>
	);
};

export default QuestionCard;
