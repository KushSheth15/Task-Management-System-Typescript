export const USER_ROUTES = {
  REGISTER: '/register',
  LOGIN: '/login',
  LOGOUT: '/logout',
};

export const TASK_ROUTES = {
  CREATE_TASK: '/create-task',
  GET_TASKS: '/get-tasks',
  GET_TASK_BY_ID: '/get-task/:id',
  UPDATE_TASK: '/update-task/:id',
  DELETE_TASK: '/delete-task/:id',
  SHARE_TASK: '/shared-task',
  MOVE_TASK: '/move-task/:id',
  GET_LIST_GROUPED: '/get-list/grouped',
  FILTER_TASK: '/tasks',
  CREATE_BULK_TASK: '/bulk-create',
  ASSIGN_BULK_TASK: '/bulk-assign',
  DELETE_BULK_TASK: '/bulk-delete',
};

export const SUBTASK_ROUTES = {
  CREATE_SUBTASK: '/create-subtask',
  UPDATE_STATUS: '/update-status/:id',
  UPDATE_DUE_DATE: '/update-due-date/:id',
};

export const REMINDER_ROUTES = {
  CREATE_REMINDER: '/create-reminder',
  UPDATE_REMINDER: '/update-reminder/:id',
};

export const API_ROUTES = {
  USERS: '/users',
  TASK: '/task',
  SUBTASK: '/subtask',
  REMINDER: '/reminder',
};

export const REST_API_PREFIX = {
  API_V1: '/api/v1',
};
