import type { Assignment, Submission } from '~/models';

/**
 * Generates a plain-text transcript for a student's submission.
 *
 * Only includes questions where at least one comment is selected.
 */
export function generateTranscript(assignment: Assignment, submission: Submission): string {
	if (!assignment || !submission) return '';

	let output = '';

	for (const q of assignment.questions) {
		const selectedIds = submission.selected[q.id] ?? [];
		if (selectedIds.length === 0) continue; // skip ungraded questions

		// Filter comments
		const selectedComments = q.comments.filter((c) => selectedIds.includes(c.id));
		if (selectedComments.length === 0) continue;

		// Add question title
		output += `# ${q.title}\n\n`;

		// Add comments
		for (const c of selectedComments) {
			const text = c.text?.trim() || '(未填寫評語)';
			output += `- ${text} (-${c.deduction})\n`;
		}

		output += `\n`; // blank line between sections
	}

	return output.trim();
}
