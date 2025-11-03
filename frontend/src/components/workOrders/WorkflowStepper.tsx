import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { WorkOrderStatus } from '../../types/common';
import {
  WORKFLOW_STAGES,
  STAGE_LABELS,
  STAGE_DESCRIPTIONS,
  getStageIndex,
  isCurrentStage,
  isCompletedStage,
  isFutureStage,
} from '../../utils/workflowUtils';

interface WorkflowStepperProps {
  currentStatus: WorkOrderStatus;
  onStatusClick?: (status: WorkOrderStatus) => void;
  disabled?: boolean;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStatus,
  onStatusClick,
  disabled = false,
}) => {
  const currentIndex = getStageIndex(currentStatus);

  const handleStepClick = (status: WorkOrderStatus) => {
    if (onStatusClick && !disabled) {
      onStatusClick(status);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Workflow Stages
      </Typography>
      <Stepper activeStep={currentIndex} orientation="vertical">
        {WORKFLOW_STAGES.map((status, index) => {
          const isCompleted = isCompletedStage(status, currentStatus);
          const isCurrent = isCurrentStage(status, currentStatus);
          const isFuture = isFutureStage(status, currentStatus);

          return (
            <Step
              key={status}
              completed={isCompleted}
              active={isCurrent}
              sx={{
                cursor: onStatusClick && !isFuture ? 'pointer' : 'default',
                '&:hover': onStatusClick && !isFuture && !disabled ? {
                  backgroundColor: 'action.hover',
                  borderRadius: 1,
                  p: 1,
                  ml: -1,
                } : {},
              }}
              onClick={() => handleStepClick(status)}
            >
              <StepLabel
                optional={
                  isCurrent && (
                    <Chip
                      label="ปัจจุบัน"
                      size="small"
                      color="primary"
                      sx={{ mt: 0.5 }}
                    />
                  )
                }
                icon={
                  isCompleted ? (
                    <CheckCircleIcon color="success" />
                  ) : isCurrent ? (
                    <RadioButtonUncheckedIcon color="primary" />
                  ) : (
                    <RadioButtonUncheckedIcon color="disabled" />
                  )
                }
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: isCurrent ? 'bold' : 'normal',
                    color: isFuture ? 'text.disabled' : 'text.primary',
                  }}
                >
                  {STAGE_LABELS[status]}
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {STAGE_DESCRIPTIONS[status]}
                </Typography>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    </Paper>
  );
};

