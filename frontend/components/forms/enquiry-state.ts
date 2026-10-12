/**
 * Shape of the enquiry form's action state.
 * It lives outside actions.ts because a 'use server' module may only export async functions.
 */
export type EnquiryState = {
  status: 'idle' | 'success' | 'invalid' | 'failed' | 'throttled';
  errors: Record<string, string>;
};

export const enquiryInitialState: EnquiryState = { status: 'idle', errors: {} };
