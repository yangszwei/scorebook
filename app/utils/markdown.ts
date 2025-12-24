import type { Assignment, Question, Comment } from '~/models';

/**
 * Converts an assignment's questions and comments to a Markdown string. Format:
 *
 * # Question Title <!-- id:uuid -->
 *
 * - Comment text <!-- id:uuid -->
 * - Comment text (-5) <!-- id:uuid -->
 */
export function assignmentToMarkdown(assignment: Assignment): string {
	return assignment.questions
		.map((q) => {
			let qText = `# ${q.title}`;
			// Preserve ID
			qText += ` <!-- id:${q.id} -->`;

			const cText = q.comments
				.map((c) => {
					let line = `- ${c.text}`;
					if (c.deduction !== undefined && c.deduction !== 0) {
						line += ` (-${Math.abs(c.deduction)})`;
					}
					// Preserve ID
					line += ` <!-- id:${c.id} -->`;
					return line;
				})
				.join('\n');

			return `${qText}\n${cText}`;
		})
		.join('\n\n');
}

/**
 * Parses a Markdown string back into an Assignment object structure. Reuses the original assignment's ID and title,
 * only replacing questions.
 */
export function parseMarkdownToAssignment(markdown: string, original: Assignment): Assignment {
	const lines = markdown.split('\n');
	const questions: Question[] = [];

	let currentQuestion: Question | null = null;

	const idRegex = /<!--\s*id:([a-zA-Z0-9-]+)\s*-->/;
	const deductionRegex = /\(-(\d+)\)/;

	for (let line of lines) {
		line = line.trim();
		if (!line) continue;

		// Check for ID
		const idMatch = line.match(idRegex);
		const existingId = idMatch ? idMatch[1] : undefined;

		// Strip ID comment from line for processing
		const content = line.replace(idRegex, '').trim();

		if (content.startsWith('#')) {
			// New Question
			const title = content.replace(/^#+\s*/, '').trim();
			currentQuestion = {
				id: existingId || crypto.randomUUID(),
				title: title || '未命名題目',
				comments: [],
			};
			questions.push(currentQuestion);
		} else if (content.startsWith('-') || content.startsWith('*')) {
			// Comment
			if (!currentQuestion) continue; // Orphan comment, ignore or handle?

			let text = content.replace(/^[-*]\s*/, '').trim();
			let deduction = 0;

			// Extract deduction like (-5)
			const dedMatch = text.match(deductionRegex);
			if (dedMatch) {
				deduction = parseInt(dedMatch[1], 10);
				// Remove deduction from text
				text = text.replace(deductionRegex, '').trim();
			}

			const comment: Comment = {
				id: existingId || crypto.randomUUID(),
				text: text || 'Empty',
				deduction,
			};
			currentQuestion.comments.push(comment);
		}
	}

	return {
		...original,
		questions,
	};
}
