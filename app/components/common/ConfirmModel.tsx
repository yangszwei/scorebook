import closeIcon from '@iconify-icons/mdi/close';
import { Icon } from '@iconify/react';
import type { FC, ReactNode } from 'react';

export interface ConfirmModalProps {
	open: boolean;
	title?: string;
	description?: ReactNode;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmModal: FC<ConfirmModalProps> = ({
	open,
	title = '確定要刪除？',
	description,
	confirmText = '刪除',
	cancelText = '取消',
	onConfirm,
	onCancel,
}) => {
	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
			onClick={onCancel}
		>
			<div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-gray-800">{title}</h2>
					<button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
						<Icon icon={closeIcon} className="text-2xl" />
					</button>
				</div>

				{description && <div className="mb-6 text-sm leading-relaxed text-gray-600">{description}</div>}

				<div className="flex justify-end gap-3">
					<button
						onClick={onCancel}
						className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
					>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;
