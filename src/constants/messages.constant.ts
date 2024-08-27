export const ERROR_MESSAGES = {
  ALL_FIELDS_REQUIRED: 'All Fields are required',
  EMAIL_OR_USERNAME_EXISTS: 'Email or Username already exists',
  EMAIL_AND_PASSWORD_REQUIRED: 'Email and Password are required',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid Credentials',
  UNAUTHORIZED_TOKEN_NOT_FOUND: 'Unauthorized - Token not found',
  TOKEN_NOT_FOUND: 'Token not found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  UNAUTHORIZED_USER: 'Unauthorized - User not found.',
  INVALID_TASK_ID: 'Invalid Task ID',

  TASK_NOT_FOUND: 'Task not found',
  INVALID_STATUS_ID: 'Invalid status ID',
  FORBIDDEN_UPDATE: 'Forbidden - You are not authorized to update this task',
  FORBIDDEN_DELETE: 'Forbidden - You are not authorized to delete this task',
  TASK_ALREADY_SHARED: 'Task is already shared with this user.',
  NO_STATUSES_FOUND: 'No statuses found',
  FORBIDDEN_ROLE: 'Forbidden - User does not have the required role',
  NO_SHARED_TASKS_FOUND: 'No Shared Tasks Found',

  TOKEN_NOT_FOUND_OR_EXPIRED: 'Unauthorized - Token not found or expired',
  TOKEN_MISMATCH: 'Unauthorized - Token mismatch',
  INVALID_TOKEN: 'Unauthorized - Invalid token',
  INVALID_REMINDER_DATE: 'Invalid reminder date',

  NO_TASK_PROVIDED: 'No tasks provided.',
  MISSING_TASK_ID_OR_USER_ID:
        'Missing taskId or userId in one or more assignments.',
  INVALID_TASK_ID_FORMAT: 'Invalid task ID.',
  NO_TASKS_FOUND_TO_DELETE: 'No tasks found to delete.',
  NO_TASK_ASSIGNMENTS_PROVIDED: 'No task assignments provided',

  REMINDER_NOT_FOUND: 'Reminder not found.',
};

export const SUCCESS_MESSAGES = {
  USER_REGISTERED_SUCCESSFULLY: 'User Registered successfully',
  USER_LOGIN_SUCCESSFULLY: 'User Login Successfully',
  USER_LOGOUT_SUCCESSFULLY: 'User Logout Successfully',

  TASK_CREATED_SUCCESSFULLY: 'Task created successfully',
  TASK_UPDATED_SUCCESSFULLY: 'Task updated successfully',
  TASK_DELETED_SUCCESSFULLY: 'Task deleted successfully',
  TASK_SHARED_SUCCESSFULLY: 'Task shared successfully',
  TASK_MOVED_SUCCESSFULLY: 'Task Moved successfully',
  TASKS_RETRIEVED_SUCCESSFULLY: 'Tasks Retrieved Successfully',
  TASKS_ASSIGNED_SUCCESSFULLY: 'Tasks assigned successfully.',

  SUBTASK_CREATED: 'Subtask created successfully',
  TASK_STATUS_UPDATED: 'Task status updated successfully',
  TASK_DUE_DATE_UPDATED: 'Task due date updated successfully',

  REMINDER_CREATED: 'Reminder created successfully.',
  REMINDER_UPDATED: 'Reminder updated successfully.',
};
