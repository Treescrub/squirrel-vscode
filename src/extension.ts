import * as path from 'path';
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

	window.showInformationMessage("Loaded!");

	let disposable = commands.registerCommand("squirrel-vscode.helloworld", () => {
		window.showInformationMessage("Hi ;)");
	});

	context.subscriptions.push(disposable);

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
			transport: TransportKind.stdio,
		},
		debug: {
			command: serverPath,
			transport: TransportKind.stdio,
		}
	};

	const clientOptions: LanguageClientOptions = {
		// Register for Squirrel files
		documentSelector: [{scheme: 'file', language: 'squirrel'}],
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

	window.showInformationMessage("Starting client!");
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}

	return client.stop();
}

function getServerPath(): string {
	let path = workspace.getConfiguration("squirrel").get("serverPath") as string;

	if(path.length > 0) {
		return path;
	} else {
		return null;
	}
}