import { render, fireEvent, screen } from '@testing-library/preact';
import '@testing-library/jest-dom';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import AssignmentItem from './AssignmentItem.tsx';

describe('AssignmentItem', () => {
  const mockAssignment = {
    id: '1',
    name: 'Test Assignment',
    grade: 85,
    weight: 20
  };
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnDelete.mockClear();
  });

  it('renders without crashing', () => {
    render(
      <AssignmentItem 
        assignment={mockAssignment} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    expect(screen.getByDisplayValue('Test Assignment')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    expect(screen.getByDisplayValue('85')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete assignment' })).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <AssignmentItem 
        assignment={mockAssignment} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    const deleteButton = screen.getByRole('button', { name: 'Delete assignment' });
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('calls onUpdate when name input is changed and blurred', () => {
    render(
      <AssignmentItem 
        assignment={mockAssignment} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    const nameInput = screen.getByDisplayValue('Test Assignment');
    fireEvent.change(nameInput, { target: { value: 'Updated Assignment' } });
    fireEvent.blur(nameInput);
    
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith('1', 'name', 'Updated Assignment');
  });

  it('does not call onUpdate when name input is not changed', () => {
    render(
      <AssignmentItem 
        assignment={mockAssignment} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    const nameInput = screen.getByDisplayValue('Test Assignment');
    fireEvent.blur(nameInput);
    
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('calls onUpdate when weight input is changed and blurred', () => {
    render(
      <AssignmentItem 
        assignment={mockAssignment} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    const weightInput = screen.getByDisplayValue('20');
    fireEvent.change(weightInput, { target: { value: '30' } });
    fireEvent.blur(weightInput);
    
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith('1', 'weight', '30');
  });

  it('calls onUpdate when grade input is changed and blurred', () => {
    render(
      <AssignmentItem 
        assignment={mockAssignment} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    const gradeInput = screen.getByDisplayValue('85');
    fireEvent.change(gradeInput, { target: { value: '90' } });
    fireEvent.blur(gradeInput);
    
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith('1', 'grade', '90');
  });

  it('blurs input field when Enter key is pressed on name input', () => {
    render(
      <AssignmentItem 
        assignment={mockAssignment} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    const nameInput = screen.getByDisplayValue('Test Assignment');
    const blurSpy = vi.spyOn(HTMLElement.prototype, 'blur');
    
    fireEvent.keyPress(nameInput, { key: 'Enter', code: 'Enter' });
    
    expect(blurSpy).toHaveBeenCalledTimes(1);
    blurSpy.mockRestore();
  });

  it('blurs input field when Enter key is pressed on weight input', () => {
    render(
      <AssignmentItem 
        assignment={mockAssignment} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    const weightInput = screen.getByDisplayValue('20');
    const blurSpy = vi.spyOn(HTMLElement.prototype, 'blur');
    
    fireEvent.keyPress(weightInput, { key: 'Enter', code: 'Enter' });
    
    expect(blurSpy).toHaveBeenCalledTimes(1);
    blurSpy.mockRestore();
  });

  it('blurs input field when Enter key is pressed on grade input', () => {
    render(
      <AssignmentItem 
        assignment={mockAssignment} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    
    const gradeInput = screen.getByDisplayValue('85');
    const blurSpy = vi.spyOn(HTMLElement.prototype, 'blur');
    
    fireEvent.keyPress(gradeInput, { key: 'Enter', code: 'Enter' });
    
    expect(blurSpy).toHaveBeenCalledTimes(1);
    blurSpy.mockRestore();
  });
});