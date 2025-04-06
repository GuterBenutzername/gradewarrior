import { render, fireEvent, screen } from '@testing-library/preact';
import '@testing-library/jest-dom';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import AssignmentForm from './AssignmentForm.tsx';

describe('AssignmentForm', () => {
  const mockData = {
    name: '',
    grade: 0,
    weight: 0,
    courseId: null,
  };
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders without crashing', () => {
    render(<AssignmentForm data={mockData} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByPlaceholderText('New assignment name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Weight')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Grade')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<AssignmentForm data={mockData} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when add button is clicked and name is not empty', () => {
    const data = { ...mockData, name: 'Test Assignment' };
    render(<AssignmentForm data={data} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not call onSubmit when add button is clicked and name is empty', () => {
    render(<AssignmentForm data={mockData} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('disables add button when name is empty', () => {
    render(<AssignmentForm data={mockData} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton).toBeDisabled();
  });

  it('enables add button when name is not empty', () => {
    const data = { ...mockData, name: 'Test Assignment' };
    render(<AssignmentForm data={data} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton).not.toBeDisabled();
  });

  it('updates data.name and calls onSubmit and onCancel when name input changes', () => {
    const data = { ...mockData };
    render(<AssignmentForm data={data} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const nameInput = screen.getByPlaceholderText('New assignment name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(data.name).toBe('New Name');
  });

  it('updates data.weight and calls onSubmit and onCancel when weight input changes', () => {
    const data = { ...mockData };
    render(<AssignmentForm data={data} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const weightInput = screen.getByPlaceholderText('Weight');
    fireEvent.change(weightInput, { target: { value: '50' } });
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(data.weight).toBe(50);
  });

  it('updates data.grade and calls onSubmit and onCancel when grade input changes', () => {
    const data = { ...mockData };
    render(<AssignmentForm data={data} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const gradeInput = screen.getByPlaceholderText('Grade');
    fireEvent.change(gradeInput, { target: { value: '90' } });
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(data.grade).toBe(90);
  });

  it('handles non-numeric weight input', () => {
    const data = { ...mockData };
    render(<AssignmentForm data={data} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const weightInput = screen.getByPlaceholderText('Weight');
    fireEvent.change(weightInput, { target: { value: 'abc' } });
    expect(data.weight).toBe(0);
  });

  it('handles non-numeric grade input', () => {
    const data = { ...mockData };
    render(<AssignmentForm data={data} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const gradeInput = screen.getByPlaceholderText('Grade');
    fireEvent.change(gradeInput, { target: { value: 'xyz' } });
    expect(data.grade).toBe(0);
  });
});
