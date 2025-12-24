import downloadIcon from '@iconify-icons/mdi/download';
import pencilIcon from '@iconify-icons/mdi/pencil-outline';
import plusIcon from '@iconify-icons/mdi/plus';
import tableIcon from '@iconify-icons/mdi/table-arrow-right';
import trashIcon from '@iconify-icons/mdi/trash-can-outline';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useAssignmentStore } from '~/stores/useAssignmentStore';
import { useSubmissionStore } from '~/stores/useSubmissionStore';
import { exportBackupJSON, exportGradesToCSV } from '~/utils/export';

export default function Home() {
	const { assignments, addAssignment, removeAssignment, updateAssignment } = useAssignmentStore();
	const { submissions } = useSubmissionStore();

	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingValue, setEditingValue] = useState('');

	const startEdit = (assignmentId: string, currentTitle: string) => {
		setEditingId(assignmentId);
		setEditingValue(currentTitle);
	};

	const stopEdit = (commit: boolean) => {
		if (commit && editingId) {
			updateAssignment(editingId, {
				title: editingValue.trim() || '未命名作業',
			});
		}
		setEditingId(null);
		setEditingValue('');
	};

	const handleCreate = () => {
		const id = crypto.randomUUID();
		addAssignment({
			id,
			title: `新作業 (${assignments.length + 1})`,
			questions: [],
		});
	};

	const handleExportAll = () => {
		exportBackupJSON(assignments, submissions);
	};

	const handleExportGrades = (assignmentId: string) => {
		const assignment = assignments.find((a) => a.id === assignmentId);
		if (!assignment) return;
		exportGradesToCSV(assignment, submissions);
	};

	return (
		<main className="min-h-screen bg-gray-50 p-8">
			<div className="mx-auto max-w-4xl space-y-8">
				{/* Header */}
				<header className="flex items-center justify-between">
					<h1 className="text-2xl font-semibold text-gray-900">作業列表</h1>

					<div className="flex gap-2">
						<button
							onClick={handleExportAll}
							className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
						>
							<Icon icon={downloadIcon} className="text-lg" />
							備份資料
						</button>

						<button
							onClick={handleCreate}
							className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
						>
							<Icon icon={plusIcon} className="text-lg" />
							新增作業
						</button>
					</div>
				</header>

				{/* Assignment list */}
				<section className="space-y-4">
					{assignments.length === 0 && (
						<div className="flex flex-col items-center py-24 text-gray-400">
							<Icon icon={plusIcon} className="mb-4 text-5xl text-gray-300" />
							<p className="text-lg">尚無作業，點擊「新增作業」。</p>
						</div>
					)}

					{assignments.map((a) => {
						const isEditing = editingId === a.id;

						return (
							<div
								key={a.id}
								className="flex min-h-[88px] items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm transition-all hover:shadow"
							>
								<div className="flex w-full flex-col justify-center">
									{/* Title Line */}
									<div className="flex h-8 items-center gap-2">
										{!isEditing ? (
											<>
												<Link
													to={`/grade/${a.id}`}
													className="flex h-full items-center text-lg font-medium text-gray-800 hover:text-blue-600"
													style={{ lineHeight: '32px' }}
												>
													{a.title}
												</Link>

												<button
													onClick={() => startEdit(a.id, a.title)}
													className="p-1 text-gray-400 hover:text-gray-600"
												>
													<Icon icon={pencilIcon} className="text-lg" />
												</button>
											</>
										) : (
											<input
												autoFocus
												value={editingValue}
												onChange={(e) => setEditingValue(e.target.value)}
												onBlur={() => stopEdit(true)}
												onKeyDown={(e) => {
													if (e.key === 'Enter') stopEdit(true);
													if (e.key === 'Escape') stopEdit(false);
												}}
												className="h-full w-full rounded-md border border-gray-300 px-2 py-0 text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
												style={{ lineHeight: '32px' }}
											/>
										)}
									</div>

									<p className="mt-1 text-sm text-gray-400">共 {a.questions.length} 題</p>
								</div>

								<div className="flex items-center">
									<button
										onClick={() => handleExportGrades(a.id)}
										className="mr-2 flex w-max items-center gap-1 rounded px-2 py-1 text-sm whitespace-nowrap text-green-600 hover:bg-green-50"
										title="匯出成績"
									>
										<Icon icon={tableIcon} className="text-lg" />
										匯出成績
									</button>

									{/* Delete */}
									<button
										onClick={() => {
											if (window.confirm('確定要刪除此作業？此動作無法復原！')) {
												removeAssignment(a.id);
											}
										}}
										className="ml-4 shrink-0 p-2 text-red-500 hover:text-red-600"
									>
										<Icon icon={trashIcon} className="text-xl" />
									</button>
								</div>
							</div>
						);
					})}
				</section>
			</div>
		</main>
	);
}
