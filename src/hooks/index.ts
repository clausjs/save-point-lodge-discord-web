import { useEffect, useState } from "react";

export const useMediaQuery = (query: any) => {
    const mediaMatch = window.matchMedia(query);
    const [ matches, setMatches ] = useState(mediaMatch.matches);

    useEffect(() => {
        const handler = (e: any) => setMatches(e.matches);
        mediaMatch.addEventListener('change', handler);
        return () => mediaMatch.removeEventListener('change', handler);
    });
    return matches;
}