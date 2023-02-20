import { isCamera, isMessage } from '../assertions';
import { Center, Paper, Text } from '@mantine/core';
import { WidgetComponent } from '..';

export const Camera: WidgetComponent<
	{
		data: { type: 'camera'; description: string; required: true };
	},
	{
		width: {
			type: 'int';
			required: false;
			default: 300;
			min: 50;
			max: 500;
			description: string;
		};
	}
> = {
	Component: ({ data, options }) => {
		const isExample = 'example' in options;

		if (isExample)
			return (
				<Center>
					<Paper withBorder>Camera feed would be here.</Paper>
				</Center>
			);

		if (!data.data)
			return (
				<Center>
					<Text>Waiting on data...</Text>
				</Center>
			);

		if (!isCamera(data.data, isMessage))
			return (
				<Center>
					<Text>Topic must follow structure of a camera publisher</Text>
				</Center>
			);

		let src = data.data.streams.data[0];

		// @ts-expect-error no .d.ts for vite vars 💀
		if (import.meta.env.TAURI_DEBUG) {
			src = 'http://127.0.0.1:1181/?action=stream';
		}

		if (!src)
			return (
				<Center>
					<Text>No source found.</Text>
				</Center>
			);

		return (
			<Center p='md'>
				<img width={options.width || 300} src={src} />
			</Center>
		);
	},
	description: 'Show a camera stream',
	sources: {
		data: {
			type: 'camera',
			required: true,
			description: 'Camera to display',
		},
	},
	options: {
		width: {
			type: 'int',
			required: false,
			default: 300,
			description: 'Width of the video window',
			min: 50,
			max: 500,
		},
	},
};
