import type { Assignment, Submission } from '~/models';

/** Exports submissions for a specific assignment as a CSV file. */
export function exportGradesToCSV(assignment: Assignment, submissions: Submission[]) {
	// Filter submissions for this assignment if not already filtered, but usually the caller should pass relevant ones
	const relevantSubmissions = submissions.filter((s) => s.assignmentId === assignment.id);

	if (relevantSubmissions.length === 0) {
		// Should we still export empty CSV or alert? Let's export empty with header.
	}

	let csv = 'Student ID,Name,Score,Comments\n';

	relevantSubmissions.forEach((s) => {
		const commentsList: string[] = [];

		// Resolve comments
		Object.entries(s.selected).forEach(([qId, cIds]) => {
			const q = assignment.questions.find((q) => q.id === qId);
			if (!q) return;
			cIds.forEach((cId) => {
				const c = q.comments.find((c) => c.id === cId);
				if (c) {
					commentsList.push(c.text);
				}
			});
		});

		// Escape quotes in comments
		const escapedComments = commentsList.join('; ').replace(/"/g, '""');

		const row = [s.student.id, s.student.name, s.score, `"${escapedComments}"`];
		csv += row.join(',') + '\n';
	});

	// Trigger download
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${assignment.title}-grades.csv`;
	a.click();
	URL.revokeObjectURL(url);
}

/** Exports all assignments and submissions as a JSON backup. */
export function exportBackupJSON(assignments: Assignment[], submissions: Submission[]) {
	const backup = {
		assignments,
		submissions,
		timestamp: new Date().toISOString(),
	};
	const data = JSON.stringify(backup, null, 2);
	const blob = new Blob([data], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `scorebook-backup-${new Date().toISOString().slice(0, 10)}.json`;
	a.click();
	URL.revokeObjectURL(url);
}
