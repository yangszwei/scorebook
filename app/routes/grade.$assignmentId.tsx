import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import AssignmentPanel from '~/components/grade/AssignmentPanel';
import StudentPanel from '~/components/grade/StudentPanel';
import { calculateScore } from '~/services/score';
import { useAssignmentStore } from '~/stores/useAssignmentStore';
import { useSubmissionStore } from '~/stores/useSubmissionStore';

export default function Grade() {
	const { assignmentId } = useParams<{ assignmentId: string }>();
	const navigate = useNavigate();

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
		<main className="grid h-screen grid-cols-2 gap-6 bg-gray-50 p-6">
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
				onImport={(data) => {
					// Check if assignment exists
					const exists = assignments.some((a) => a.id === data.id);
					if (exists) {
						if (confirm(`確定要覆蓋現有的 "${data.title}" 嗎？\n這將會更新現有的作業設定。`)) {
							updateAssignment(data.id, data);
						} else {
							return;
						}
					} else {
						addAssignment(data);
					}

					// Navigate to it (in case ID is different or it's new)
					if (data.id !== assignmentId) {
						navigate(`/grade/${data.id}`);
					}
				}}
			/>

			<StudentPanel
				assignment={assignment}
				submissions={relatedSubmissions}
				submission={activeSubmission}
				locked={locked}
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

					// After deletion, simply clear user intent
					// The derived activeSubmission will fallback safely
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
		</main>
	);
}
