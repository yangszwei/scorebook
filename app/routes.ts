import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
	route('grade/:assignmentId', 'routes/grade.$assignmentId.tsx'),
] satisfies RouteConfig;
