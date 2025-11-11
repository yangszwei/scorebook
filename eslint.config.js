import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
	globalIgnores(['.react-router', 'build']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat['recommended-latest'],
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2022,
			globals: globals.browser,
		},
		rules: {
			// See: https://github.com/remix-run/react-router/discussions/10856#discussioncomment-12642926
			'react-refresh/only-export-components': [
				'warn',
				{
					allowExportNames: [
						'middleware',
						'clientMiddleware',
						'loader',
						'clientLoader',
						'action',
						'clientAction',
						'ErrorBoundary',
						'HydrateFallback',
						'headers',
						'handle',
						'links',
						'meta',
						'shouldRevalidate',
					],
				},
			],
		},
	},
]);
