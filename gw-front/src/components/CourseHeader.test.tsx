import { render, fireEvent, screen } from '@testing-library/preact';
import '@testing-library/jest-dom';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import CourseHeader from './CourseHeader.tsx';
import { Course } from '../types.ts';

describe('CourseHeader', () => {
  const mockCourse: Course = {
    id: '1',
    name: 'Test Course',
    assignments: []
  };
  
  const mockProps = {
    course: mockCourse,
    isEditing: false,
    editName: 'Test Course',
    onEditStart: vi.fn(),
    onEditChange: vi.fn(),
    onEditSave: vi.fn(),
    onDelete: vi.fn()
  };

  beforeEach(() => {
    mockProps.onEditStart.mockClear();
    mockProps.onEditChange.mockClear();
    mockProps.onEditSave.mockClear();
    mockProps.onDelete.mockClear();
  });

  it('renders course name in view mode', () => {
    render(<CourseHeader {...mockProps} />);
    
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit course' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete course' })).toBeInTheDocument();
  });

  it('renders edit mode when isEditing is true', () => {
    render(<CourseHeader {...mockProps} isEditing />);
    
    expect(screen.getByDisplayValue('Test Course')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.queryByText('Test Course')).not.toBeInTheDocument();
  });

  it('calls onEditStart when edit button is clicked', () => {
    render(<CourseHeader {...mockProps} />);
    
    const editButton = screen.getByRole('button', { name: 'Edit course' });
    fireEvent.click(editButton);
    
    expect(mockProps.onEditStart).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<CourseHeader {...mockProps} />);
    
    const deleteButton = screen.getByRole('button', { name: 'Delete course' });
    fireEvent.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('calls onEditChange when input value changes in edit mode', () => {
    render(<CourseHeader {...mockProps} isEditing />);
    
    const input = screen.getByDisplayValue('Test Course');
    fireEvent.change(input, { target: { value: 'Updated Course' } });
    
    expect(mockProps.onEditChange).toHaveBeenCalledTimes(1);
    expect(mockProps.onEditChange).toHaveBeenCalledWith('Updated Course');
  });

  it('calls onEditSave when save button is clicked in edit mode', () => {
    render(<CourseHeader {...mockProps} isEditing />);
    
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    
    expect(mockProps.onEditSave).toHaveBeenCalledTimes(1);
  });

  it('disables save button when editName is empty', () => {
    render(<CourseHeader {...mockProps} isEditing editName="" />);
    
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when editName is not empty', () => {
    render(<CourseHeader {...mockProps} isEditing editName="Updated Course" />);
    
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).not.toBeDisabled();
  });

  it('calls onEditSave when Enter key is pressed in edit mode', () => {
    render(<CourseHeader {...mockProps} isEditing />);
    
    const input = screen.getByDisplayValue('Test Course');
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockProps.onEditSave).toHaveBeenCalledTimes(1);
  });

  it('calls onEditSave when input is blurred and value has changed', () => {
    render(<CourseHeader {...mockProps} isEditing editName="Updated Course" />);
    
    const input = screen.getByDisplayValue('Updated Course');
    fireEvent.blur(input);
    
    expect(mockProps.onEditSave).toHaveBeenCalledTimes(1);
  });

  it('calls onEditChange with original name when input is blurred and value has not changed', () => {
    render(<CourseHeader {...mockProps} isEditing editName="Test Course" />);
    
    const input = screen.getByDisplayValue('Test Course');
    fireEvent.blur(input);
    
    expect(mockProps.onEditSave).not.toHaveBeenCalled();
    expect(mockProps.onEditChange).toHaveBeenCalledTimes(1);
    expect(mockProps.onEditChange).toHaveBeenCalledWith('Test Course');
  });

  it('has autofocus on the input field in edit mode', () => {
    render(<CourseHeader {...mockProps} isEditing />);
    
    const input = screen.getByDisplayValue('Test Course');
    expect(input).toHaveAttribute('autofocus');
  });
});