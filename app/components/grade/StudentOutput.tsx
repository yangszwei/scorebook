import copyIcon from '@iconify-icons/mdi/content-copy';
import { Icon } from '@iconify/react';
import type { FC } from 'react';
import type { Assignment, Submission } from '~/models';
import { generateTranscript } from '~/services/transcript';

export interface StudentOutputProps {
	assignment: Assignment | null;
	submission: Submission | null;
}

const StudentOutput: FC<StudentOutputProps> = ({ assignment, submission }) => {
	// No student → show an empty state
	if (!submission) {
		return <div className="flex h-full items-center justify-center text-gray-400 italic">尚未選擇學生。</div>;
	}

	if (!assignment) {
		return <div className="flex h-full items-center justify-center text-gray-400 italic">找不到作業。</div>;
	}

	const transcript = generateTranscript(assignment, submission);

	const copyText = () => {
		if (!transcript) return;
		navigator.clipboard.writeText(transcript);
	};

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="mb-3 flex items-center justify-between">
				<h2 className="text-base font-semibold text-gray-700">評語輸出</h2>

				<button
					onClick={copyText}
					className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 active:bg-blue-100 active:text-blue-700"
					title="複製輸出"
				>
					<Icon icon={copyIcon} className="text-lg" />
					複製
				</button>
			</div>

			{/* Transcript box */}
			<div className="flex-1 overflow-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
				{transcript || <span className="text-gray-400 italic">此學生尚未選取任何評語。</span>}
			</div>
		</div>
	);
};

export default StudentOutput;
