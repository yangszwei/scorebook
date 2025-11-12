import type { Assignment } from './Assignment';
import type { Comment } from './Comment';
import type { Question } from './Question';
import type { Student } from './Student';

/** A student's submitted work for an assignment. Contains grading selections and computed total score. */
export interface Submission {
	/** Unique submission identifier. */
	id: string;

	/** The referenced assignment ID. */
	assignmentId: Assignment['id'];

	/** The student who submitted the work. */
	student: Student;

	/** Selected comment IDs per question (questionId → commentIds). */
	selected: Record<Question['id'], Comment['id'][]>;

	/** Final computed score (e.g., 100 - total deduction). */
	score: number;
}
