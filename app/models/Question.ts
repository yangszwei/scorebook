import type { Comment } from './Comment';

/** A question defined within an assignment. Each question contains a collection of comments. */
export interface Question {
	/** Unique question identifier. */
	id: string;

	/** Title or short description of the question. */
	title: string;

	/** Possible comments associated with this question. */
	comments: Comment[];
}
