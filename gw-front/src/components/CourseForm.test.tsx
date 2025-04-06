import { render, fireEvent, screen } from '@testing-library/preact';
import '@testing-library/jest-dom';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import CourseForm from './CourseForm.tsx';

describe('CourseForm', () => {
  const mockName = '';
  const mockOnNameChange = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnNameChange.mockClear();
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders without crashing', () => {
    render(
      <CourseForm 
        name={mockName} 
        onNameChange={mockOnNameChange} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByPlaceholderText('Course name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <CourseForm 
        name={mockName} 
        onNameChange={mockOnNameChange} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onNameChange when input value changes', () => {
    render(
      <CourseForm 
        name={mockName} 
        onNameChange={mockOnNameChange} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const input = screen.getByPlaceholderText('Course name');
    fireEvent.change(input, { target: { value: 'New Course' } });
    
    expect(mockOnNameChange).toHaveBeenCalledTimes(1);
    expect(mockOnNameChange).toHaveBeenCalledWith('New Course');
  });

  it('disables add button when name is empty', () => {
    render(
      <CourseForm 
        name="" 
        onNameChange={mockOnNameChange} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton).toBeDisabled();
  });

  it('enables add button when name is not empty', () => {
    render(
      <CourseForm 
        name="Test Course" 
        onNameChange={mockOnNameChange} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton).not.toBeDisabled();
  });

  it('calls onSubmit when add button is clicked', () => {
    render(
      <CourseForm 
        name="Test Course" 
        onNameChange={mockOnNameChange} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton);
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when Enter key is pressed and name is not empty', () => {
    render(
      <CourseForm 
        name="Test Course" 
        onNameChange={mockOnNameChange} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const input = screen.getByPlaceholderText('Course name');
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not call onSubmit when Enter key is pressed and name is empty', () => {
    render(
      <CourseForm 
        name="" 
        onNameChange={mockOnNameChange} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const input = screen.getByPlaceholderText('Course name');
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('has autofocus on the input field', () => {
    render(
      <CourseForm 
        name={mockName} 
        onNameChange={mockOnNameChange} 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    const input = screen.getByPlaceholderText('Course name');
    expect(input).toHaveAttribute('autofocus');
  });
});