// /home/ubuntu/admin_project/d1-admin-main/frontend/src/components/OKR/ObjectiveFormModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Typography } from '@mui/material';
import { Objective, KeyResult } from '../../services/okrApiService'; // Assuming types are exported from service

interface ObjectiveFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (objectiveData: Omit<Objective, 'id' | 'keyResults' | 'createdAt' | 'updatedAt' | 'overallProgress' | 'netConfidenceScore'>) => void;
  initialData?: Objective | null;
  currentQuarter: string;
}

const ObjectiveFormModal: React.FC<ObjectiveFormModalProps> = ({ open, onClose, onSubmit, initialData, currentQuarter }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responsible, setResponsible] = useState('');
  // Add other fields as needed, e.g., tags

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setResponsible(initialData.responsible || '');
    } else {
      // Reset form for new objective
      setTitle('');
      setDescription('');
      setResponsible('');
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!title || !responsible) {
      // Basic validation
      alert('Title and Responsible are required.');
      return;
    }
    onSubmit({
      title,
      description,
      responsible,
      quarter: currentQuarter, // Pass current quarter
      // ownerId: 'currentUserId', // TODO: Get current user ID from auth context
      // tags: [],
    });
    onClose(); // Close modal after submission
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Objective' : 'Create New Objective'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField 
            label="Objective Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
          <TextField 
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          <TextField 
            label="Responsible (Team/Individual)"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            fullWidth
            required
          />
          <Typography variant="caption">Quarter: {currentQuarter}</Typography>
          {/* Add fields for tags, ownerId if needed */}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? 'Save Changes' : 'Create Objective'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ObjectiveFormModal;

