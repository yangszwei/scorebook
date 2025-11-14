import { useLayoutEffect, useRef } from 'react';

export interface AutoTextareaProps {
	value: string;
	placeholder?: string;
	onChange: (value: string) => void;
	className?: string;
	disabled?: boolean;
}

/**
 * Auto-resizing textarea for comment rows.
 *
 * Expands based on content and shrinks when text becomes shorter. Works inside flex row layouts.
 */
export default function AutoTextarea({ value, placeholder, onChange, className = '', disabled }: AutoTextareaProps) {
	const ref = useRef<HTMLTextAreaElement | null>(null);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		el.style.height = '0px';
		el.style.height = `${el.scrollHeight}px`;
	}, [value]);

	return (
		<textarea
			ref={ref}
			value={value}
			disabled={disabled}
			placeholder={placeholder}
			onChange={(e) => onChange(e.target.value)}
			className={`w-full resize-none overflow-hidden bg-transparent text-lg leading-5 focus:ring-0 focus:outline-none ${disabled ? 'opacity-50' : ''} ${className} `}
			rows={1}
		/>
	);
}
