type CommandOption = {
    name: string;
    description: string;
    required: boolean;
    type: string;
}

export type Command = {
    name: string;
    description: string;
    options?: CommandOption[];
}

export type TabledCommands = {
    [id: string]: Command;
}