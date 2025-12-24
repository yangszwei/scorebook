import checkIcon from '@iconify-icons/mdi/check';
import downloadIcon from '@iconify-icons/mdi/download';
import homeIcon from '@iconify-icons/mdi/home';
import addIcon from '@iconify-icons/mdi/plus';
import tableIcon from '@iconify-icons/mdi/table-arrow-right';
import textBoxEditIcon from '@iconify-icons/mdi/text-box-edit-outline';
import uploadIcon from '@iconify-icons/mdi/upload';
import { Icon } from '@iconify/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import AssignmentPanel from '~/components/grade/AssignmentPanel';
import MarkdownEditor from '~/components/grade/MarkdownEditor';
import StudentPanel from '~/components/grade/StudentPanel';
import { calculateScore } from '~/services/score';
import { useAssignmentStore } from '~/stores/useAssignmentStore';
import { useSubmissionStore } from '~/stores/useSubmissionStore';
import { exportGradesToCSV } from '~/utils/export';
import { assignmentToMarkdown, parseMarkdownToAssignment } from '~/utils/markdown';

export default function Grade() {
	const { assignmentId } = useParams<{ assignmentId: string }>();
	const navigate = useNavigate();

	const [viewMode, setViewMode] = useState<'visual' | 'markdown'>('visual');
	const [markdownValue, setMarkdownValue] = useState('');

	const {
		assignments,
		addAssignment,
		updateAssignment,
		addQuestion,
		updateQuestion,
		removeQuestion,
		addComment,
		updateComment,
		removeComment,
	} = useAssignmentStore();

	const { submissions, upsertSubmission, removeSubmission, updateSelectionForQuestion, updateScore } =
		useSubmissionStore();

	// Assignment (may be null)
	const assignment = assignments.find((a) => a.id === assignmentId) ?? null;

	// Submissions of this assignment
	const relatedSubmissions = useMemo(() => {
		if (!assignment) return [];
		return submissions.filter((s) => s.assignmentId === assignment.id);
	}, [submissions, assignment]);

	const locked = relatedSubmissions.length === 0;

	// Active submission ID (user intent only)
	const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

	// Derived activeSubmission (NO effect, NO setState)
	const activeSubmission = useMemo(() => {
		if (relatedSubmissions.length === 0) return null;

		// If user hasn't selected anything, fallback to first
		if (!activeSubmissionId) return relatedSubmissions[0];

		// If selected one still exists, pick it
		return (
			relatedSubmissions.find((s) => s.id === activeSubmissionId) ?? relatedSubmissions[0] // fallback if deleted
		);
	}, [relatedSubmissions, activeSubmissionId]);

	// Auto-recalculate score
	useEffect(() => {
		if (!assignment || locked || !activeSubmission) return;

		const newScore = calculateScore(assignment, activeSubmission, 100);
		if (newScore !== activeSubmission.score) {
			updateScore(activeSubmission.id, newScore);
		}
	}, [assignment, locked, activeSubmission, updateScore]);

	// Index for next/prev student navigation
	const idx = activeSubmission ? relatedSubmissions.findIndex((s) => s.id === activeSubmission.id) : -1;

	if (!assignment) {
		return (
			<main className="p-8">
				<p className="font-medium text-red-600">找不到作業。</p>
				<button onClick={() => navigate('/')} className="mt-2 text-blue-600 hover:underline">
					返回首頁
				</button>
			</main>
		);
	}

	return (
		<main className="grid h-screen grid-cols-2 grid-rows-[auto_1fr] gap-4 bg-gray-50 p-4">
			<header className="col-span-full flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm">
				{/* Left: Authoring Tools */}
				<div className="flex items-center gap-3">
					{viewMode === 'visual' ? (
						<>
							<button
								onClick={() =>
									addQuestion(assignment.id, {
										id: crypto.randomUUID(),
										title: `問題${assignment.questions.length + 1}`,
										comments: [],
									})
								}
								className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
							>
								<Icon icon={addIcon} className="text-lg" />
								新增
							</button>

							<button
								onClick={() => {
									setMarkdownValue(assignmentToMarkdown(assignment));
									setViewMode('markdown');
								}}
								className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50"
							>
								<Icon icon={textBoxEditIcon} className="text-lg" />
								快速編輯
							</button>

							<div className="h-5 w-px bg-gray-200"></div>

							<label className="flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
								<Icon icon={uploadIcon} className="text-lg" />
								匯入JSON
								<input
									type="file"
									accept=".json"
									className="hidden"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (!file) return;
										const reader = new FileReader();
										reader.onload = (ev) => {
											try {
												const json = ev.target?.result as string;
												const parsed = JSON.parse(json);
												if (parsed.id && parsed.title) {
													if (confirm(`覆蓋 "${parsed.title}"？`)) {
														updateAssignment(parsed.id, parsed);
													} else {
														addAssignment(parsed);
														navigate(`/grade/${parsed.id}`);
													}
												}
											} catch {
												alert('無效檔案');
											}
										};
										reader.readAsText(file);
										e.target.value = '';
									}}
								/>
							</label>

							<button
								onClick={() => {
									const data = JSON.stringify(assignment, null, 2);
									const blob = new Blob([data], { type: 'application/json' });
									const url = URL.createObjectURL(blob);
									const a = document.createElement('a');
									a.href = url;
									a.download = `${assignment.title}.json`;
									a.click();
									URL.revokeObjectURL(url);
								}}
								className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
							>
								<Icon icon={downloadIcon} className="text-lg" />
								匯出JSON
							</button>
						</>
					) : (
						<button
							onClick={() => {
								try {
									const newAssignment = parseMarkdownToAssignment(markdownValue, assignment);
									updateAssignment(assignment.id, newAssignment);
									setViewMode('visual');
								} catch {
									alert('Markdown parsing failed');
								}
							}}
							className="flex items-center gap-1 rounded-md bg-purple-600 px-3 py-2 text-sm font-bold text-white hover:bg-purple-700"
						>
							<Icon icon={checkIcon} className="text-lg" />
							完成編輯
						</button>
					)}
				</div>

				{/* Right: Context & Reporting */}
				<div className="flex items-center gap-4">
					<button
						onClick={() => exportGradesToCSV(assignment, submissions)}
						className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
					>
						<Icon icon={tableIcon} className="text-lg" />
						匯出成績
					</button>

					<div className="h-5 w-px bg-gray-300"></div>

					<h1 className="text-lg font-bold text-gray-900">{assignment.title}</h1>

					<div className="h-5 w-px bg-gray-300"></div>

					<Link
						to="/"
						className="flex items-center gap-1 rounded-md px-2 py-1 text-gray-500 hover:text-blue-600"
						title="返回列表"
					>
						<Icon icon={homeIcon} className="text-xl" />
					</Link>
				</div>
			</header>

			{viewMode === 'markdown' ? (
				<MarkdownEditor value={markdownValue} onChange={setMarkdownValue} />
			) : (
				<AssignmentPanel
					assignment={assignment}
					submission={activeSubmission}
					locked={locked}
					onAddQuestion={() =>
						addQuestion(assignment.id, {
							id: crypto.randomUUID(),
							title: `問題${assignment.questions.length + 1}`,
							comments: [],
						})
					}
					onRenameQuestion={(qid, title) => updateQuestion(assignment.id, qid, { title })}
					onRemoveQuestion={(qid) => removeQuestion(assignment.id, qid)}
					onAddComment={(qid) =>
						addComment(assignment.id, qid, {
							id: crypto.randomUUID(),
							text: '',
							deduction: 0,
						})
					}
					onEditComment={(qid, cid, patch) => updateComment(assignment.id, qid, cid, patch)}
					onRemoveComment={(qid, cid) => removeComment(assignment.id, qid, cid)}
					onToggleComment={(qid, cid, checked) => {
						if (!activeSubmission) return;
						if (locked) return;

						const current = activeSubmission.selected[qid] ?? [];
						const next = checked ? [...new Set([...current, cid])] : current.filter((id) => id !== cid);

						updateSelectionForQuestion(activeSubmission.id, qid, next);
					}}
				/>
			)}

			<div className="relative flex h-full flex-col overflow-hidden">
				{viewMode === 'markdown' && (
					<div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xs">
						<p className="font-medium text-gray-500">編輯模式中無法評分</p>
					</div>
				)}
				<StudentPanel
					assignment={assignment}
					submissions={relatedSubmissions}
					submission={activeSubmission}
					locked={locked || viewMode === 'markdown'}
					onChangeStudent={(id) => setActiveSubmissionId(id)}
					onAddStudent={(id, name) => {
						const s = upsertSubmission(assignment.id, {
							id,
							name,
						});
						setActiveSubmissionId(s.id);
					}}
					onRemoveStudent={() => {
						if (!activeSubmission) return;

						removeSubmission(activeSubmission.id);
						setActiveSubmissionId(null);
					}}
					onNext={() => {
						if (idx < 0) return;
						const next = relatedSubmissions[(idx + 1) % relatedSubmissions.length];
						setActiveSubmissionId(next.id);
					}}
					onPrev={() => {
						if (idx < 0) return;
						const prev = relatedSubmissions[(idx - 1 + relatedSubmissions.length) % relatedSubmissions.length];
						setActiveSubmissionId(prev.id);
					}}
				/>
			</div>
		</main>
	);
}
