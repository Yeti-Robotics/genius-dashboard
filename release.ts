#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run
import {
	increment,
	ReleaseType,
} from 'https://deno.land/std@0.181.0/semver/mod.ts';

type TauriConfig = {
	package: {
		version: string;
	};
};

const config: TauriConfig = JSON.parse(
	Deno.readTextFileSync('./src-tauri/tauri.conf.json')
);

const newVer = increment(config.package.version, Deno.args[0] as ReleaseType);

if (newVer === null) {
	console.error('Somethings went wrong updating the version, args:', Deno.args);
	Deno.exit(1);
}

if (!confirm(`Do you want to publish ${newVer}?`)) Deno.exit(0);

config.package.version = newVer;
Deno.writeTextFileSync(
	'./src-tauri/tauri.conf.json',
	JSON.stringify(config, null, '\t') + '\n'
);

const run = (args: string[]) => {
	const process = Deno.run({ cmd: args, stdout: 'piped' });
	return Promise.all([process.output(), process.status()]).then(() =>
		process.close()
	);
};

/*
git add .
git commit -m "[release] $1"
git push origin
git tag $1
git push origin $1
*/
await run(['git', 'add', '.']);
await run(['git', 'commit', '-m', `[release] ${newVer}`]);
await run(['git', 'push', 'origin']);
await run(['git', 'tag', newVer]);
await run(['git', 'push', 'origin', newVer]);


