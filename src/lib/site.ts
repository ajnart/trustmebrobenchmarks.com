import pkg from '../../package.json';

export const SITE_NAME = 'Trust Me Bro Benchmarks';
export const REPO_URL = 'https://github.com/ajnart/trustmebrobenchmarks.com';
export const NEW_ISSUE_URL = `${REPO_URL}/issues/new?title=${encodeURIComponent('Verify my model (trust me)')}&body=${encodeURIComponent('Model name:\nClaimed score:\nEvidence: trust me\n')}`;
export const INDEX_NAME = 'Trust Me Bro Intelligence Index';
export const INDEX_VERSION = `v${pkg.version}`;
export const CF_BEACON_TOKEN = '815121693a49447391208ed3fa67d4d2';
