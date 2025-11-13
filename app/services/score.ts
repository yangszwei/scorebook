import type { Assignment, Submission } from '~/models';

/**
 * Calculate the final score for a submission based on the assignment structure.
 *
 * - Iterates all questions in the assignment
 * - For each selected comment, adds its deduction
 * - Returns: baseScore - totalDeduction (never below zero)
 *
 * @param assignment Full assignment definition (questions + comments)
 * @param submission Student's submission including selected comments
 * @param baseScore Starting score before deductions (default: 100)
 */
export function calculateScore(assignment: Assignment, submission: Submission, baseScore = 100): number {
	let totalDeduction = 0;

	for (const question of assignment.questions) {
		const selected = submission.selected[question.id] ?? [];

		for (const commentId of selected) {
			const comment = question.comments.find((c) => c.id === commentId);
			if (comment) {
				totalDeduction += comment.deduction;
			}
		}
	}

	const final = Math.max(0, baseScore - totalDeduction);
	return Math.round(final * 100) / 100; // keep consistent decimals
}

/**
 * Recalculate scores for all submissions belonging to an assignment. Useful when comments/deductions change and all
 * scores need refreshing.
 *
 * @param assignment The assignment structure after updates
 * @param submissions Array of submissions that reference this assignment
 * @param baseScore Base score per submission (default: 100)
 */
export function recalculateScoresForAssignment(
	assignment: Assignment,
	submissions: Submission[],
	baseScore = 100,
): Submission[] {
	return submissions.map((sub) =>
		sub.assignmentId === assignment.id
			? {
					...sub,
					score: calculateScore(assignment, sub, baseScore),
				}
			: sub,
	);
}
