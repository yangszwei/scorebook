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
		}),
		{ name: 'scorebook.submissions' },
	),
);
