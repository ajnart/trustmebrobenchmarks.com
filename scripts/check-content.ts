import { formatProblems, validateContent } from '../src/lib/content';

const problems = validateContent();
if (problems.length > 0) {
  console.error(formatProblems(problems));
  process.exit(1);
}
console.log('Content integrity: ok');
