export type CommunityActionErrors = {
  attachments?: string;
  content?: string;
  tags?: string;
  title?: string;
};

export type CommunityActionState = {
  errors?: CommunityActionErrors;
  message: string;
};

export const initialCommunityActionState: CommunityActionState = {
  message: "",
};
