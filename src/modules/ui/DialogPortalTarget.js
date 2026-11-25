import {createContext} from 'react';

// A containing native <dialog> can host nested React dialogs in its top layer.
// Every existing caller defaults to the original document.body portal.
export const DialogPortalTarget=createContext(null);
