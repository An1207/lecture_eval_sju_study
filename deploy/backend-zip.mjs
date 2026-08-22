import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const backendRoot = join(root, 'backend');
const deployRoot = join(root, 'deploy');
const stageRoot = join(deployRoot, 'backend-stage');
const stageDist = join(stageRoot, 'dist');
const bestzip = join(backendRoot, 'node_modules', '.bin', 'bestzip');
const tsc = join(backendRoot, 'node_modules', '.bin', 'tsc.cmd');

rmSync(stageRoot, { recursive: true, force: true });
mkdirSync(stageDist, { recursive: true });

try {
  execSync(`"${tsc}" -p "${join(backendRoot, 'tsconfig.build.json')}" --outDir "${stageDist}" --incremental false`, {
    cwd: backendRoot,
    stdio: 'inherit',
    shell: true,
  });

  copyFileSync(join(backendRoot, 'package.json'), join(stageRoot, 'package.json'));
  copyFileSync(join(backendRoot, 'package-lock.json'), join(stageRoot, 'package-lock.json'));
  copyFileSync(join(backendRoot, '.env.example'), join(stageRoot, '.env.example'));

  execSync(`"${bestzip}" "${join(deployRoot, 'backend-deploy.zip')}" dist package.json package-lock.json .env.example`, {
    cwd: stageRoot,
    stdio: 'inherit',
    shell: true,
  });

  console.log('Created deploy/backend-deploy.zip');
} finally {
  rmSync(stageRoot, { recursive: true, force: true });
}
