export type UsernameActionErrors = {
  username?: string;
};

export type UsernameActionState = {
  errors?: UsernameActionErrors;
  message: string;
  success: boolean;
  username: string;
};

export const initialUsernameActionState: UsernameActionState = {
  message: "",
  success: false,
  username: "",
};
