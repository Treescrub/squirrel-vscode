import { workspace, ExtensionContext, window, commands } from 'vscode';
import { existsSync } from 'fs';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	console.log("Activated squirrel-vscode extension");

	const serverPath = getServerPath();

	if(serverPath === null) {
		window.showErrorMessage("No server path defined")
		return;
	}
	if(!existsSync(serverPath)) {
		window.showErrorMessage("Bad server path: \"${serverPath}\"")
		return;
	}

	const serverOptions: ServerOptions = {
		run: {
			command: serverPath,
			transport: TransportKind.ipc,
		},
		debug: {
			command: serverPath,
			transport: TransportKind.ipc,
		}
	};

	const clientOptions: LanguageClientOptions = {
		// Register for Squirrel files
		documentSelector: [{language: 'squirrel'}],
		synchronize: {
			// Notify the server about file changes to .nut files in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.nut')
		}
	};

	client = new LanguageClient(
		'squirrelLanguageServer',
		'Squirrel Language Server',
		serverOptions,
		clientOptions
	);

	client.start();

	console.log("Starting client!");
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}

	return client.stop();
}

function getServerPath(): string {
	let path = workspace.getConfiguration("squirrel").get("server.path") as string;

	if(path.length > 0) {
		return path;
	} else {
		return null;
	}
}