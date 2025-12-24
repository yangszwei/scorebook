import QuestionCard from './QuestionCard';
import uploadIcon from '@iconify-icons/mdi/upload';
import { Icon } from '@iconify/react';
import type { FC } from 'react';
import type { Assignment, Submission, Comment } from '~/models';

export interface AssignmentPanelProps {
	assignment: Assignment;
	submission: Submission | null;
	locked: boolean;

	onAddQuestion: () => void;
	onRenameQuestion: (questionId: string, title: string) => void;
	onRemoveQuestion: (questionId: string) => void;

	onAddComment: (questionId: string) => void;
	onEditComment: (questionId: string, commentId: string, patch: Partial<Comment>) => void;
	onRemoveComment: (questionId: string, commentId: string) => void;
	onToggleComment: (questionId: string, commentId: string, checked: boolean) => void;

	onImport?: (assignment: Assignment) => void;
}

/** The assignment editor panel. Renders list of QuestionCards and allows adding new questions. */
const AssignmentPanel: FC<AssignmentPanelProps> = ({
	assignment,
	submission,
	locked,

	onAddQuestion,
	onRenameQuestion,
	onRemoveQuestion,

	onAddComment,
	onEditComment,
	onRemoveComment,
	onToggleComment,

	onImport,
}) => {
	const questions = assignment.questions;

	const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (ev) => {
			try {
				const json = ev.target?.result as string;
				const parsed = JSON.parse(json);
				// Basic validation
				if (parsed.id && parsed.title && Array.isArray(parsed.questions)) {
					onImport?.(parsed);
				} else {
					alert('無效的作業格式');
				}
			} catch (err) {
				console.error(err);
				alert('無法讀取檔案');
			}
		};
		reader.readAsText(file);
		// Reset input
		e.target.value = '';
	};

	return (
		<div className="flex h-full flex-col overflow-y-auto pr-3">
			{/* Empty state */}
			{questions.length === 0 && (
				<div className="flex h-full items-center justify-center">
					<div className="flex flex-col items-center text-center text-gray-400">
						<Icon icon="mdi:file-outline" className="mb-4 text-5xl opacity-60" />
						<p className="mb-1 text-lg font-medium">尚無題目</p>
						<p className="mb-4 text-sm">點擊「新增題目」建立第一個問題。</p>

						<div className="flex gap-2">
							<button
								onClick={onAddQuestion}
								className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
							>
								<Icon icon="mdi:plus" className="text-lg" />
								新增題目
							</button>

							<label className="flex cursor-pointer items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50">
								<Icon icon={uploadIcon} className="text-lg" />
								匯入作業
								<input type="file" accept=".json" onChange={handleImport} className="hidden" />
							</label>
						</div>
					</div>
				</div>
			)}

			{/* List of questions */}
			<div className="flex flex-col gap-6">
				{questions.map((q) => (
					<QuestionCard
						key={q.id}
						question={q}
						submission={submission}
						locked={locked}
						onRename={(title) => onRenameQuestion(q.id, title)}
						onRemove={() => onRemoveQuestion(q.id)}
						onAddComment={() => onAddComment(q.id)}
						onEditComment={(cid, patch) => onEditComment(q.id, cid, patch)}
						onRemoveComment={(cid) => onRemoveComment(q.id, cid)}
						onToggleComment={(cid, checked) => onToggleComment(q.id, cid, checked)}
					/>
				))}
			</div>
		</div>
	);
};

export default AssignmentPanel;
