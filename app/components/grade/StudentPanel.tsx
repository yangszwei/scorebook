import StudentOutput from './StudentOutput';
import accountIcon from '@iconify-icons/mdi/account-plus';
import arrowLeftIcon from '@iconify-icons/mdi/chevron-left';
import arrowRightIcon from '@iconify-icons/mdi/chevron-right';
import deleteIcon from '@iconify-icons/mdi/delete-outline';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import type { FC } from 'react';
import ConfirmModal from '~/components/common/ConfirmModel';
import type { Assignment, Submission } from '~/models';
import { useSubmissionStore } from '~/stores/useSubmissionStore';

export interface StudentPanelProps {
	assignment: Assignment | null;
	submissions: Submission[];
	submission: Submission | null;

	onChangeStudent: (id: string) => void;
	onAddStudent: (id: string, name: string) => void;
	onRemoveStudent: () => void;
	onNext: () => void;
	onPrev: () => void;
	locked: boolean;
}

const StudentPanel: FC<StudentPanelProps> = ({
	assignment,
	submissions,
	submission,
	onChangeStudent,
	onAddStudent,
	onRemoveStudent,
	onNext,
	onPrev,
}) => {
	const hasStudents = submissions.length > 0;

	const updateStudentName = useSubmissionStore((s) => s.updateStudentName);
	const updateStudentId = useSubmissionStore((s) => s.updateStudentId);

	/** Score click-to-copy */
	const score = submission?.score ?? 0;
	const copyScore = () => navigator.clipboard.writeText(String(score));

	/** Add student */
	const handleAddStudent = () => {
		const el = document.getElementById('new-student') as HTMLInputElement;
		const values = el?.value?.trim().split(' ');
		onAddStudent(values[0], values[1] || '未命名學生');
		el.value = '';
	};

	/** Modal state */
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	return (
		<div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
			<div className="mb-4 flex items-center justify-between gap-4">
				{/* Student selector */}
				<div className="flex flex-1 items-center gap-2">
					<select
						disabled={!hasStudents}
						value={submission?.id || ''}
						onChange={(e) => onChangeStudent(e.target.value)}
						className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
					>
						{!hasStudents && <option>尚無學生</option>}
						{hasStudents &&
							submissions.map((s) => (
								<option key={s.id} value={s.id}>
									{s.student.name || '未命名學生'} {s.student.id ? `(${s.student.id})` : ''}
								</option>
							))}
					</select>

					{/* Prev */}
					<button
						disabled={!hasStudents}
						onClick={onPrev}
						className="cursor-pointer rounded-md p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
					>
						<Icon icon={arrowLeftIcon} className="text-xl" />
					</button>

					{/* Next */}
					<button
						disabled={!hasStudents}
						onClick={onNext}
						className="cursor-pointer rounded-md p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
					>
						<Icon icon={arrowRightIcon} className="text-xl" />
					</button>
				</div>

				{/* Add & Delete student */}
				<div className="flex items-center gap-2">
					<abbr title="請輸入「學號 姓名」">
						<input
							id="new-student"
							type="text"
							placeholder="新增學生"
							className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
						/>
					</abbr>

					{/* Add Student */}
					<button
						onClick={handleAddStudent}
						className="flex cursor-pointer items-center gap-1 rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
					>
						<Icon icon={accountIcon} className="text-lg" />
						新增
					</button>

					{/* Delete Student (modal trigger) */}
					<button
						onClick={() => submission && setShowDeleteModal(true)}
						disabled={!submission}
						className="cursor-pointer rounded-md p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"
						title="刪除當前學生"
					>
						<Icon icon={deleteIcon} className="text-xl" />
					</button>
				</div>
			</div>

			{submission && (
				<div className="mb-4 grid grid-cols-2 gap-6 rounded-lg bg-gray-50 px-4 py-3">
					<div className="flex items-center gap-3">
						<div className="w-8 text-gray-500">學號</div>
						<input
							value={submission.student.id}
							onChange={(e) => updateStudentId(submission.id, e.target.value)}
							className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
						/>
					</div>

					<div className="flex items-center gap-3">
						<div className="w-8 text-gray-500">姓名</div>
						<input
							value={submission.student.name}
							onChange={(e) => updateStudentName(submission.id, e.target.value)}
							className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
						/>
					</div>
				</div>
			)}

			<div className="mb-4 rounded-lg bg-gray-50 px-4 py-3">
				<div className="text-sm text-gray-500">分數</div>
				<button
					onClick={copyScore}
					className="mt-1 text-4xl font-semibold text-gray-800 hover:text-blue-600 active:text-blue-700"
					title="點擊以複製"
				>
					{score}
				</button>
			</div>

			{/* Output */}
			<div className="flex-1">
				<StudentOutput assignment={assignment} submission={submission ?? null} />
			</div>

			{/* Confirm Delete Modal */}
			<ConfirmModal
				open={showDeleteModal}
				title="刪除學生"
				description={
					<div>
						確定要刪除學生
						<strong className="mx-1">「{submission?.student.name || '未命名學生'}」</strong>
						嗎？
						<br />
						此操作無法復原。
					</div>
				}
				confirmText="刪除"
				cancelText="取消"
				onConfirm={() => {
					setShowDeleteModal(false);
					onRemoveStudent();
				}}
				onCancel={() => setShowDeleteModal(false)}
			/>
		</div>
	);
};

export default StudentPanel;
