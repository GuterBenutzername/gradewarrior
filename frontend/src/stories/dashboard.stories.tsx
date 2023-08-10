import type { Meta, StoryObj } from '@storybook/react';

import Dashboard from '../dashboard/dashboard';

const meta: Meta<typeof Dashboard> = {
    component: Dashboard,
};

export default meta;
type Story = StoryObj<typeof Dashboard>;

export const Premium: Story = {
    args: {premium: true}
}