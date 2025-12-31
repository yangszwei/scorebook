import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Submission, Student } from '~/models';

/**
 * Zustand store for managing all student submissions and grading data.
 *
 * Each submission references a specific assignment and contains the student's selected comments and computed total
 * score.
 */
export interface SubmissionState {
	/** All student submissions currently stored. */
	submissions: Submission[];

	/** Add a new submission. */
	addSubmission: (submission: Submission) => void;

	/** Remove a submission by its unique ID. */
	removeSubmission: (id: string) => void;

	/** Update comment selections for a given submission. The `selected` map represents questionId → commentIds. */
	updateSelection: (submissionId: string, selected: Record<string, string[]>) => void;

	/** Update a single question’s selected comments. Useful for partial UI updates in grading. */
	updateSelectionForQuestion: (submissionId: string, questionId: string, commentIds: string[]) => void;

	/** Update the final computed score (e.g., after recalculation). */
	updateScore: (submissionId: string, score: number) => void;

	/** Clear all submissions for a given assignment. */
	clearByAssignment: (assignmentId: string) => void;

	/** Add or update (upsert) a student's submission for a given assignment. */
	upsertSubmission: (assignmentId: string, student: Student) => Submission;

	/**
	 * Sync all submissions’ scores after assignment definition changes. This can be called when deductions or comments
	 * are updated.
	 */
	resyncScores: (assignmentId: string, calcFn: (submission: Submission) => number) => void;

	/** Update a student’s name. */
	updateStudentName: (submissionId: string, name: string) => void;

	/** Update a student’s ID. */
	updateStudentId: (submissionId: string, id: string) => void;

	/**
	 * Merge a batch of submissions.
	 * Matches existing submissions by `assignmentId` + `student.id`.
	 * - If exists: updates score and merges selected comments.
	 * - If new: adds it.
	 */
	mergeSubmissions: (submissions: Submission[]) => void;
}

/**
 * Centralized submission store for all grading-related state. Automatically persisted in localStorage under
 * `scorebook.submissions`.
 */
export const useSubmissionStore = create<SubmissionState>()(
	persist(
		(set, get) => ({
			submissions: [],

			addSubmission: (submission) =>
				set((state) => ({
					submissions: [...state.submissions, submission],
				})),

			removeSubmission: (id) =>
				set((state) => ({
					submissions: state.submissions.filter((s) => s.id !== id),
				})),

			updateSelection: (submissionId, selected) =>
				set((state) => ({
					submissions: state.submissions.map((s) => (s.id === submissionId ? { ...s, selected } : s)),
				})),

			updateSelectionForQuestion: (submissionId, questionId, commentIds) =>
				set((state) => ({
					submissions: state.submissions.map((s) =>
						s.id === submissionId
							? {
								...s,
								selected: {
									...s.selected,
									[questionId]: commentIds,
								},
							}
							: s,
					),
				})),

			updateScore: (submissionId, score) =>
				set((state) => ({
					submissions: state.submissions.map((s) => (s.id === submissionId ? { ...s, score } : s)),
				})),

			clearByAssignment: (assignmentId) =>
				set((state) => ({
					submissions: state.submissions.filter((s) => s.assignmentId !== assignmentId),
				})),

			upsertSubmission: (assignmentId, student) => {
				const state = get();
				const existing = state.submissions.find((s) => s.assignmentId === assignmentId && s.student.id === student.id);
				if (existing) return existing;

				const newSubmission: Submission = {
					id: crypto.randomUUID(),
					assignmentId,
					student,
					selected: {},
					score: 100,
				};
				set({ submissions: [...state.submissions, newSubmission] });
				return newSubmission;
			},

			resyncScores: (assignmentId, calcFn) =>
				set((state) => ({
					submissions: state.submissions.map((s) => (s.assignmentId === assignmentId ? { ...s, score: calcFn(s) } : s)),
				})),

			updateStudentName: (submissionId, name) =>
				set((state) => ({
					submissions: state.submissions.map((s) =>
						s.id === submissionId ? { ...s, student: { ...s.student, name } } : s,
					),
				})),

			updateStudentId: (submissionId, id) =>
				set((state) => ({
					submissions: state.submissions.map((s) =>
						s.id === submissionId ? { ...s, student: { ...s.student, id } } : s,
					),
				})),

			mergeSubmissions: (incoming) =>
				set((state) => {
					let nextSubmissions = [...state.submissions];

					for (const inc of incoming) {
						const index = nextSubmissions.findIndex(
							(s) => s.assignmentId === inc.assignmentId && s.student.id === inc.student.id,
						);

						if (index !== -1) {
							// Exists: Merge properties (e.g. score, selections)
							// Strategy: Incoming 'selected' comments usually override or merge.
							// Here we will merge the 'selected' maps: union of comment IDs for each question.
							const existing = nextSubmissions[index];

							const mergedSelected = { ...existing.selected };
							for (const [qid, cids] of Object.entries(inc.selected)) {
								const currentCids = mergedSelected[qid] ?? [];
								// Union
								mergedSelected[qid] = [...new Set([...currentCids, ...cids])];
							}

							nextSubmissions[index] = {
								...existing,
								score: inc.score, // Prefer incoming score (or could re-calc?)
								selected: mergedSelected,
								// if student name changed in import, update it?
								student: { ...existing.student, name: inc.student.name || existing.student.name },
							};
						} else {
							// New
							// Ensure ID is unique (incoming SHOULD have ID, but better safe to keep it if valid or gen new if collision with OTHER assignment's submission - though UUIDs shouldn't collide)
							// Actually, if we are importing, we might want to regenerate IDs to avoid collisions?
							// But if we want to round-trip export/import, keeping IDs is nice.
							// Let's keep incoming ID if not present in ENTIRE store.
							const idExists = nextSubmissions.some((s) => s.id === inc.id);
							const newSubmission = {
								...inc,
								id: idExists ? crypto.randomUUID() : inc.id,
							};
							nextSubmissions.push(newSubmission);
						}
					}

					return { submissions: nextSubmissions };
				}),
		}),
		{ name: 'scorebook.submissions' },
	),
);
