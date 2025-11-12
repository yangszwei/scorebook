/** A comment applied to a question, with an optional score deduction. Represents one selectable grading item. */
export interface Comment {
	/** Unique comment identifier. */
	id: string;

	/** Text of the comment. */
	text: string;

	/** Points deducted when this comment is selected. */
	deduction: number;
}
