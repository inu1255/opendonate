module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};