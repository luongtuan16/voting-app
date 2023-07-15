export const getReasonFromError = (error) => {
    const idx = error?.reason?.indexOf('reason string');
    return idx > -1 ? error?.reason?.substr(idx + 13)?.trim() : 'Error!';
}