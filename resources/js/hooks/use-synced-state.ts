import { useState } from 'react';

/**
 * Local state that re-syncs when the value it mirrors changes.
 *
 * Used for search inputs whose canonical value lives in the URL: the field
 * stays editable while typing, but snaps back to the server value after a
 * filter visit. Implemented with React's "adjust state during render"
 * pattern rather than an effect, so no cascading render is scheduled.
 *
 * @see https://react.dev/reference/react/useState#storing-information-from-previous-renders
 */
export function useSyncedState<T>(source: T): [T, (value: T) => void] {
    const [value, setValue] = useState(source);
    const [previousSource, setPreviousSource] = useState(source);

    if (source !== previousSource) {
        setPreviousSource(source);
        setValue(source);
    }

    return [value, setValue];
}
