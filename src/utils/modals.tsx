import { SettingsForm } from "@/components/Layout/Menu/SettingsForm";
import { openModal } from "@mantine/modals";
import { startClient } from "./client";

export const openSettingsModal = () => openModal({
	id: 'settings',
	title: 'Settings',
	children: <SettingsForm />,
	onClose: startClient,
});
