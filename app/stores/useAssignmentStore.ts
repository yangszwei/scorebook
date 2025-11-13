import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Assignment, Question, Comment } from '~/models';

/**
 * Zustand store managing all assignments, questions, and comments.
 *
 * Each assignment defines its grading structure, including the available questions and their possible comments.
 */
export interface AssignmentState {
	/** All assignments currently defined. */
	assignments: Assignment[];

	/** Add a new assignment. */
	addAssignment: (assignment: Assignment) => void;

	/** Update an existing assignment by ID. */
	updateAssignment: (id: string, update: Partial<Assignment>) => void;

	/** Remove an assignment by ID. */
	removeAssignment: (id: string) => void;

	/** Add a new question to a given assignment. */
	addQuestion: (assignmentId: string, question: Question) => void;

	/** Update an existing question. */
	updateQuestion: (assignmentId: string, questionId: string, update: Partial<Question>) => void;

	/** Remove a question from an assignment. */
	removeQuestion: (assignmentId: string, questionId: string) => void;

	/** Add a new comment to a specific question. */
	addComment: (assignmentId: string, questionId: string, comment: Comment) => void;

	/** Update an existing comment. */
	updateComment: (assignmentId: string, questionId: string, commentId: string, update: Partial<Comment>) => void;

	/** Remove a comment from a question. */
	removeComment: (assignmentId: string, questionId: string, commentId: string) => void;
}

/**
 * Central store for managing assignments and their nested structure. Automatically persisted in localStorage under
 * `scorebook.assignments`.
 */
export const useAssignmentStore = create<AssignmentState>()(
	persist(
		(set) => ({
			assignments: [],

			addAssignment: (assignment) =>
				set((state) => ({
					assignments: [...state.assignments, assignment],
				})),

			updateAssignment: (id, update) =>
				set((state) => ({
					assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...update } : a)),
				})),

			removeAssignment: (id) =>
				set((state) => ({
					assignments: state.assignments.filter((a) => a.id !== id),
				})),

			addQuestion: (assignmentId, question) =>
				set((state) => ({
					assignments: state.assignments.map((a) =>
						a.id === assignmentId ? { ...a, questions: [...a.questions, question] } : a,
					),
				})),

			updateQuestion: (assignmentId, questionId, update) =>
				set((state) => ({
					assignments: state.assignments.map((a) =>
						a.id === assignmentId
							? {
									...a,
									questions: a.questions.map((q) => (q.id === questionId ? { ...q, ...update } : q)),
								}
							: a,
					),
				})),

			removeQuestion: (assignmentId, questionId) =>
				set((state) => ({
					assignments: state.assignments.map((a) =>
						a.id === assignmentId
							? {
									...a,
									questions: a.questions.filter((q) => q.id !== questionId),
								}
							: a,
					),
				})),

			addComment: (assignmentId, questionId, comment) =>
				set((state) => ({
					assignments: state.assignments.map((a) =>
						a.id === assignmentId
							? {
									...a,
									questions: a.questions.map((q) =>
										q.id === questionId ? { ...q, comments: [...q.comments, comment] } : q,
									),
								}
							: a,
					),
				})),

			updateComment: (assignmentId, questionId, commentId, update) =>
				set((state) => ({
					assignments: state.assignments.map((a) =>
						a.id === assignmentId
							? {
									...a,
									questions: a.questions.map((q) =>
										q.id === questionId
											? {
													...q,
													comments: q.comments.map((c) => (c.id === commentId ? { ...c, ...update } : c)),
												}
											: q,
									),
								}
							: a,
					),
				})),

			removeComment: (assignmentId, questionId, commentId) =>
				set((state) => ({
					assignments: state.assignments.map((a) =>
						a.id === assignmentId
							? {
									...a,
									questions: a.questions.map((q) =>
										q.id === questionId
											? {
													...q,
													comments: q.comments.filter((c) => c.id !== commentId),
												}
											: q,
									),
								}
							: a,
					),
				})),
		}),
		{ name: 'scorebook.assignments' },
	),
);
