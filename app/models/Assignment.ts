import type { Question } from './Question';

/** A grading template containing one or more questions. Acts as the definition base for student submissions. */
export interface Assignment {
	/** Unique assignment identifier. */
	id: string;

	/** Assignment name. */
	title: string;

	/** Questions that make up this assignment. */
	questions: Question[];
}
